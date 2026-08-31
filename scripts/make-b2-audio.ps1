$ErrorActionPreference = 'Stop'

$project = Split-Path $PSScriptRoot -Parent
$output = Join-Path $project 'public\audio\b2'
New-Item -ItemType Directory -Force -Path $output | Out-Null

$js = @'
import { B2_LISTENING_PARTS } from './src/data/b2-multilevel.js';
const items = [];
for (const part of B2_LISTENING_PARTS) {
  if (part.audioSrc) items.push({ path: part.audioSrc, text: part.audio });
  for (const question of part.questions) {
    if (question.audioSrc) items.push({ path: question.audioSrc, text: question.audio });
  }
}
console.log(JSON.stringify(items));
'@

Push-Location $project
try {
  $manifest = (& node --input-type=module -e $js) | ConvertFrom-Json
} finally {
  Pop-Location
}

$voice = New-Object -ComObject SAPI.SpVoice
$voices = $voice.GetVoices()
$format = New-Object -ComObject SAPI.SpAudioFormat
$format.Type = 22
$index = 0

foreach ($item in $manifest) {
  $relative = $item.path -replace '/', '\'
  $target = Join-Path (Join-Path $project 'public') $relative
  $stream = New-Object -ComObject SAPI.SpFileStream
  try {
    $voice.Voice = $voices.Item($index % $voices.Count)
    $voice.Rate = -1
    $stream.Format = $format
    $stream.Open($target, 3, $false)
    $voice.AudioOutputStream = $stream
    [void]$voice.Speak([string]$item.text)
  } finally {
    $stream.Close()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($stream)
  }
  Write-Host "created $target"
  $index += 1
}

[void][Runtime.InteropServices.Marshal]::ReleaseComObject($voice)
[void][Runtime.InteropServices.Marshal]::ReleaseComObject($format)
