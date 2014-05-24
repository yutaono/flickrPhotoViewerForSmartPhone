;(function(window) {

    /**
     * optionsで指定されたajaxを実行するメソッド.
     */
    function requestSearch(options) {
        var defer = $.Deferred();

        $.ajax({
            type: options.method,
            url: options.url,
            data: options.params
        })
        .done(function(data) {
            defer.resolve(data);
        })
        .fail(function() {
            console.log('fail...');
            defer.reject();
        });

        return defer.promise();
    }

    /*
     * Flickrのphoto_idから詳細情報を取得するメソッド.
     */
    function getDetailById(id) {
        var defer = $.Deferred();

        var options = {};
        options.url = 'https://api.flickr.com/services/rest/';
        options.method = 'GET';
        options.params = {
            method: 'flickr.photos.getInfo',
            photo_id: id,
            api_key: '69558575cccfeb6086b6193f3f8d1776',
            format: 'json',
            nojsoncallback: 1
        };

        requestSearch(options).done(function(info){
            return info;
        });
    }


    /**
     * Flickrで取得した写真オブジェクトから写真のurlを取得するメソッド.
     */
    function getFlickrURL(self, tail) {
         var fileHead = "http://farm" + self.farm + ".static.flickr.com/" + self.server + "/" + self.id + "_" + self.secret;
         return fileHead + tail;
    }

    /**
     * public functions
     */
    window.requestSearch = requestSearch;
    window.getDetailById = getDetailById;
    window.getFlickrURL = getFlickrURL;

})(window);
