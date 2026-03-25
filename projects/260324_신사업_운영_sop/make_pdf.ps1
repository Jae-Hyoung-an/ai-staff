$ErrorActionPreference = "Stop"

$baseDir = $PSScriptRoot
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (!(Test-Path $chromePath)) { throw "Chrome not found: $chromePath" }

$allMd = Get-ChildItem -Path $baseDir -Filter "*.md" | Where-Object { $_.Name -like "*sop*.md" }
$mainSop = $allMd | Where-Object { $_.Name -notlike "*_ppt_*" } | Select-Object -First 1
$pptMds = $allMd | Where-Object { $_.Name -like "*_ppt_*" }
$mdFiles = @()
if ($mainSop) { $mdFiles += $mainSop }
$mdFiles += $pptMds

if ($mdFiles.Count -ne 4) {
    throw "Expected 4 markdown files, found $($mdFiles.Count)"
}

foreach ($mdFile in $mdFiles) {
    $mdPath = $mdFile.FullName
    $mdName = $mdFile.Name
    $md = [System.IO.File]::ReadAllText($mdPath, [System.Text.UTF8Encoding]::new($true))

    if ($mdName -notlike "*_ppt_*") {
        $flowImg = Join-Path $baseDir "flowchart_pdf_render.png"
        $ganttImg = Join-Path $baseDir "gantt_pdf_render.png"
        $script:mermaidIdx = 0
        $pattern = '(?s)```mermaid\s*(.*?)```'

        if ((Test-Path $flowImg) -and (Test-Path $ganttImg)) {
            $flowB64 = [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes($flowImg))
            $ganttB64 = [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes($ganttImg))
            $md = [System.Text.RegularExpressions.Regex]::Replace($md, $pattern, {
                param($m)
                $script:mermaidIdx++
                if ($script:mermaidIdx -eq 1) { return "![](data:image/png;base64,$flowB64)" }
                if ($script:mermaidIdx -eq 2) { return "![](data:image/png;base64,$ganttB64)" }
                return "> Mermaid block"
            })
        } else {
            $md = [System.Text.RegularExpressions.Regex]::Replace($md, $pattern, {
                param($m)
                $script:mermaidIdx++
                $mmdCode = $m.Groups[1].Value.Trim()
                $tmpMmdPath = Join-Path $baseDir ("_tmp_mermaid_" + $script:mermaidIdx + ".mmd")
                $imgName = "sop_mermaid_" + $script:mermaidIdx + ".png"
                $imgPath = Join-Path $baseDir $imgName
                [System.IO.File]::WriteAllText($tmpMmdPath, $mmdCode, [System.Text.UTF8Encoding]::new($true))
                & curl.exe -sS -X POST "https://kroki.io/mermaid/png" -H "Content-Type: text/plain; charset=utf-8" --data-binary "@$tmpMmdPath" -o "$imgPath" | Out-Null
                Remove-Item $tmpMmdPath -ErrorAction SilentlyContinue
                if ((Test-Path $imgPath) -and ((Get-Item $imgPath).Length -gt 1000)) { return "![Mermaid Diagram $($script:mermaidIdx)](./$imgName)" }
                return "> Mermaid render failed: diagram $($script:mermaidIdx)"
            })
        }
    }

    $mdBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($md))
    $safeTitle = [System.IO.Path]::GetFileNameWithoutExtension($mdName)
    $html = @"
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <title>$safeTitle</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css/github-markdown.min.css">
  <style>
    html, body { background: #fff !important; color: #111 !important; }
    :root { color-scheme: light only !important; }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background: #fff !important;
      z-index: -1;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 24px;
      font-size: 14px;
      line-height: 1.6;
      background: #fff !important;
    }
    .markdown-body, .markdown-body * { color: #111 !important; }
    .markdown-body table, .markdown-body th, .markdown-body td { background: #fff !important; border-color: #ddd !important; }
    .markdown-body code, .markdown-body pre { background: #f6f8fa !important; color: #111 !important; }
    .markdown-body a { color: #0969da !important; }
    img { max-width: 100%; height: auto; }
    @page { size: A4; margin: 16mm; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  </style>
</head>
<body>
  <article id="app" class="markdown-body"></article>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    const b64 = "$mdBase64";
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const md = new TextDecoder("utf-8").decode(bytes);
    document.getElementById("app").innerHTML = marked.parse(md, { gfm: true, breaks: true });
  </script>
</body>
</html>
"@

    $htmlPath = Join-Path $baseDir ($safeTitle + ".for_pdf.html")
    $pdfPath = Join-Path $baseDir ($safeTitle + ".pdf")
    [System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.UTF8Encoding]::new($true))

    $fileUri = (New-Object System.Uri($htmlPath)).AbsoluteUri
    & "$chromePath" --headless --disable-gpu --allow-file-access-from-files --disable-features=WebContentsForceDark,AutoDarkModeForWebContents --force-dark-mode=0 --virtual-time-budget=15000 --print-to-pdf="$pdfPath" "$fileUri" | Out-Null
    if (!(Test-Path $pdfPath) -or ((Get-Item $pdfPath).Length -lt 5000)) {
        throw "PDF generation failed: $pdfPath"
    }
}

Write-Output "PDF generation complete"
