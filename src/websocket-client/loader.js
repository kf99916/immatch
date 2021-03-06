/**
 * Takes responsibility for loading all the defined images.
 * @namespace
 */
imMatch.loader = {
    /**
     * Loads load-list.json. It will start to load all the defined images if it succeeded to load the json; otherwise, throw a exception.
     * @param {Function} fn The callback function
     */
    load: function(fn) {
        var loadList = "load-list.json", self = this;

        this.images = {};
        this.createProgressBar();

        jQuery.ajax({
            type: "GET",
            url: loadList,
            async: true,
            dataType: "json",
            success: function(data, textStatus, jqXHR) {
                imMatch.logInfo("Succeeded to load the list:", loadList, textStatus, jqXHR);
                self.loadData(data, fn);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                jQuery.error("Failed to load the list: ", loadList, jqXHR, textStatus, errorThrown);
            }
        });
    },

    /**
     * Create a progress bar
     */
    createProgressBar: function() {
        var width = imMatch.viewport.width * imMatch.device.ppi * 3 / 4, height = width * 0.05;
        this.progressBar = document.createElement("progress");

        this.progressBar.id = "progress";
        this.progressBar.value = 0;
        this.progressBar.setAttribute("style", "width: " + width + "px; " +
                                    "height: " + height + "px; " +
                                    "position: absolute; top: 50%; left: 50%; " +
                                    "margin-left: " + -width / 2 + "px; " +
                                    "margin-top: " + -height / 2 + "px;");

        document.body.appendChild(this.progressBar);
    },

    /**
     * Loads all the defined images. Invokes the given callback function if it succeeded to load.
     * @param {Object} data Data in load-list.json
     * @param {Function} fn The callback function
     */
    loadData: function(data, fn) {
        var self = this;
        this.progressBar.max = data.length;
        jQuery.each(data, function(i, item) {
            var image;
            if (imMatch.isEmpty(item.ppi) || imMatch.isEmpty(item.src) ||
                imMatch.isEmpty(item.type) || imMatch.isEmpty(item.id)) {
                return;
            }

            if (item.type !== "image") {
                return;
            }

            image = new Image();
            image.ppi = item.ppi;
            image.src = item.src;
            image.id = item.id;

            image.onload = function() {
                self.images[this.id] = this;
                ++self.progressBar.value;
                if (self.progressBar.value >= self.progressBar.max) {
                    imMatch.isReady = returnTrue;
                    jQuery("#progress").remove();

                    if (!jQuery.isFunction(fn)) {
                        return;
                    }

                    fn();
                }
            };

            image.onerror = function() {
                jQuery.error("Failed to load the image: " + image.src);
            };
        });
    }
};