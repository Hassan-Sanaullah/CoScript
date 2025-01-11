import os from 'os';
import fs from 'fs';

// Get network interfaces
const interfaces = os.networkInterfaces();
console.log(interfaces);  // Log all network interfaces to check names and details

let localIp = '';
for (let interfaceName in interfaces) {
    // Check if interface is either Wi-Fi or Ethernet or any other name you find in the log
    if (interfaceName === 'wlan0' || interfaceName === 'eth0' || interfaceName === 'wlp3s0' || interfaceName === 'eth0') {
        interfaces[interfaceName].forEach(interfaceDetails => {
            if (!interfaceDetails.internal && interfaceDetails.family === 'IPv4') {
                localIp = interfaceDetails.address;
            }
        });
    }
}

// Check if local IP was found
if (localIp) {
    const envFile = '.env';

    // Define the content template with the placeholder `privateIP`
    const envContent = `
VITE_API_URL=http://${localIp}:3000
VITE_SOCKET_URL=http://${localIp}:3001
VITE_LOCAL_API_URL=http://localhost:3000
    `;

    // Write the new content back to the .env file
    fs.writeFileSync(envFile, envContent.trim());  // .trim() to remove extra newlines

    console.log(`.env file rewritten with new local IP: ${localIp}`);
} else {
    console.log('Could not detect local IP address.');
}
