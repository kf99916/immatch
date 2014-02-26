imMatch.Device = {
    MacBookPro: {
        ppi: 113,
        syncAreaSize: 0.3,
        margin: {
            top: 0.7,
            bottom: 0.7,
            left: 0.7,
            right: 0.7
        }
    },

    iPhone: {
        ppi: 163,
        syncAreaSize: 0.3,
        margin: {
            top: (4.5 - 480 / 163) / 2,
            bottom: (4.5 - 480 / 163) / 2,
            left: (2.31 - 320 / 163) / 2,
            right: (2.31 - 320 / 163) / 2
        }
    },

    iPhone5: {
        ppi: 163,
        syncAreaSize: 0.3,
        margin: {
            top: (4.87 - 1136 / 326) / 2,
            bottom: (4.87 - 1136 / 326) / 2,
            left: (2.31 - 640 / 326) / 2,
            right: (2.31 - 640 / 326) / 2
        }
    },

    iPad: {
        ppi: 132,
        syncAreaSize: 0.3,
        margin: {
            top: (9.5 - 1024 / 132) / 2,
            bottom: (9.5 - 1024 / 132) / 2,
            left: (7.31 - 768 / 132) / 2,
            right: (7.31 - 768 / 132) / 2
        }
    },
};

imMatch.extend(MobileEsp, {
    DetectIphone5: function() {
        if (!MobileEsp.DetectIphoneOrIpod()) {
            return false;
        }

        return (window.screen.availHeight > 480);    
    }
});

imMatch.device = imMatch.Device.MacBookPro;
if (MobileEsp.DetectIphone5()) {
    imMatch.device = imMatch.Device.iPhone5;
}
else if (MobileEsp.DetectIphoneOrIpod()) {
    imMatch.device = imMatch.Device.iPhone;
}
else if (MobileEsp.DetectIpad()) {
    imMatch.device = imMatch.Device.iPad;
}


imMatch.device.devicePixelRatio = window.devicePixelRatio || 1;