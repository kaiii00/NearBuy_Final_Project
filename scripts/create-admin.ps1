# Creates an admin user via Spring auth API (Spring must be running on port 8080).
$body = @{
    username = "admin"
    email    = "admin@nearbuy.com"
    password = "Admin12345"
    role     = "admin"
    address  = "NearBuy HQ"
    contact  = "0000000000"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Admin created successfully."
    Write-Host "Username: admin"
    Write-Host "Password: Admin12345"
    Write-Host "Role: $($response.role)"
} catch {
    $msg = $_.ErrorDetails.Message
    if ($msg -match "already") {
        Write-Host "Admin user already exists. Log in with:"
        Write-Host "  Username: admin"
        Write-Host "  Password: Admin12345 (or the password you set earlier)"
    } else {
        Write-Host "Failed: $($_.Exception.Message)"
        if ($msg) { Write-Host $msg }
        Write-Host "Ensure Spring Boot is running (docker compose up springboot-app)."
    }
}
