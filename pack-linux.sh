electron-packager app intraSocial --overwrite
sudo chown root:root /home/frank/GitHub/IntraHouse/intrasocial-client/intraSocial-linux-x64/chrome-sandbox
sudo chmod 4755 /home/frank/GitHub/IntraHouse/intrasocial-client/intraSocial-linux-x64/chrome-sandbox
zip -r intraSocial-linux.zip intraSocial-linux-x64/ && mv intraSocial-linux.zip intraSocial-linux-x64/