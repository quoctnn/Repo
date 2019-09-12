path = require('path');

module.exports = {
    packagerConfig: {
        icon: path.resolve(__dirname, 'app/assets/icons/png/512x512.png'),
        electronVersion: "6.0.8"
    },
    makers: [
        {
            name: '@electron-forge/maker-dmg',
            config: {
                format: 'ULFO'
            }
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: [
                'darwin'
            ]
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    maintainer: 'IntraHouse AS',
                    homepage: 'https://intrahouse.com',
                    icon: path.resolve(__dirname, 'app/assets/icons/png/512x512.png')
                }
            }
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {}
        }
    ]
}