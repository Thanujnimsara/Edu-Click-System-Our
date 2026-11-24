$proc = Start-Process -FilePath "npx.cmd" -ArgumentList "tsx","src/server.ts" -WorkingDirectory "backend" -PassThru
Start-Sleep -Seconds 4

try {
  $health = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health"
  Write-Host "[TEST 1] HEALTH:" ($health | ConvertTo-Json -Compress)

  $grades = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/grades"
  Write-Host "[TEST 2] GRADES COUNT:" $grades.data.Count

  $classes = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/classes"
  Write-Host "[TEST 3] CLASSES COUNT:" $classes.data.Count

  $body = @{ identifier = "student_kamal"; password = "Student@1234" } | ConvertTo-Json
  $login = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/auth/login" -Body $body -ContentType "application/json"
  Write-Host "[TEST 4] LOGIN SUCCESS:" $login.success "STUDENT REG NO:" $login.data.user.registrationNumber "ROLE:" $login.data.user.role

  $token = $login.data.accessToken
  $headers = @{ Authorization = "Bearer $token" }

  $myClasses = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/enrollments/my" -Headers $headers
  Write-Host "[TEST 5] ENROLLED CLASSES:" $myClasses.data.Count

  $adminBody = @{ identifier = "admin"; password = "Admin@1234" } | ConvertTo-Json
  $adminLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/auth/login" -Body $adminBody -ContentType "application/json"
  $adminHeaders = @{ Authorization = "Bearer $($adminLogin.data.accessToken)" }
  $adminStats = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/stats" -Headers $adminHeaders
  Write-Host "[TEST 6] ADMIN CONSOLE STATS:" ($adminStats.data | ConvertTo-Json -Compress)
} finally {
  Stop-Process -Id $proc.Id -Force
}
