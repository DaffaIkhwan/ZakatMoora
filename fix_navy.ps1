$files = @(
    'MuzakkiManagement.tsx',
    'MuzakkiDashboard.tsx',
    'MustahikDatabase.tsx',
    'MonitoringModule.tsx',
    'MonitoringForm.tsx',
    'CriteriaManager.tsx',
    'AidPrograms.tsx',
    'ResultsTable.tsx',
    'ConfirmDialog.tsx'
)

foreach ($f in $files) {
    $path = "c:\Users\Acer\Downloads\Research Framework Development\src\components\$f"
    $content = Get-Content $path -Raw
    
    # Replace DialogContent bg patterns
    $content = $content -replace '!bg-white dark:!bg-\[#0a1628\]', 'dialog-bg-navy'
    $content = $content -replace 'bg-white dark:bg-\[#0a1628\]', 'dialog-bg-navy'
    
    # Replace border patterns  
    $content = $content -replace 'dark:border dark:border-\[#1a2d4a\]', 'dialog-border-navy'
    $content = $content -replace 'border-slate-200 dark:border-\[#1a2d4a\]', 'dialog-border-navy'
    
    # Replace border-0 + dialog-border-navy pattern (keep border-0 for ones that had it)
    $content = $content -replace 'border-0 dialog-border-navy', 'dialog-border-navy border'
    
    Set-Content $path $content -NoNewline
    Write-Host "Updated: $f"
}
