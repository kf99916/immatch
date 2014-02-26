imMatch.localGesture = {
    recognize: function(touchMouseEvent) {
        var handler = touchMouseEvent.type + "Handler";
        if (!this[handler]) {
            return;
        }

        this[handler](touchMouseEvent);
    },

    touchmousedownHandler: function(touchMouseEvent) {
    },

    touchmouseupHandler: function(touchMouseEvent) {
    },

    touchmousemoveHandler: function(touchMouseEvent) {
    },

    touchmousecancelHandler:function(touchMouseEvent) {
    },
};