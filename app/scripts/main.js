/*
 * Flickr for Smartphone
 *
 * 以下の2つの場合に動作する.
 * landscape mode : 横画面のモード
 * portrait mode : 縦画面のモード
 *
 * author: yutaono
 */
(function($, window, document) {
    $(function() {
        var options = getFlickOptions(TEXT, PER_PAGE, currentPage);

        /**
         * 画像を取得し、それぞれのモードで画面を描画する。
         */
        requestSearch(options).done(function(data){
            generatePhotoDOM(data.photos.photo);
            isAjaxDone = true;

            if (isLandscape()) {
                landscapeMode();
            } else {
                portraitMode();
            }
        });

        /**
         * 画面の向きを検知した時にモードを切り替える。
         */
        $(window).on('resize', function(){
            if (isLandscape()) {
                landscapeMode();
            } else {
                portraitMode();
            }
        });
    });

    /**
     * variables
     */
    var currentPhotoNumber = 0; // 現在表示している画像の番号(サムネイル画像は除く)
    var photoDatas = []; // 画像のデータ
    var originalPhotos = []; // オリジナルサイズの画像を保持する配列
    var isDisplayingOriginal = false;
    var isAjaxDone = false; //
    var TEXT = 'colorful';
    var PER_PAGE = 28;
    var currentPage = 1;
    var AUTO_TRANSITION_TIME = 8000;

    /**
     * 横画面のモード
     */
    function landscapeMode() {
        setTimeout(scrollTo, 100, 0, 1); // アドレスバーを消す。
        $('.card').remove();
        isDisplayingOriginal = false;

        $('#landscape').append(originalPhotos[currentPhotoNumber]);
        $('img', '#landscape').addClass('original fadeIn');
        $(window).off('scroll');

        swipeImage($('#container'));

        var autoTransition = setInterval(transitionImage, AUTO_TRANSITION_TIME);

        function transitionImage() {
            if (currentPhotoNumber === photoDatas.length - 1) {
                var options = getFlickOptions(TEXT, PER_PAGE, ++currentPage);

                isAjaxDone = false;
                requestSearch(options).done(function(data){
                    generatePhotoDOM(data.photos.photo);
                    isAjaxDone = true;
                    nextImage(++currentPhotoNumber);
                });
            } else {
                nextImage(++currentPhotoNumber);
            }
        }

        /*
         * 画面をSwiipeした際に画像を入れ替えるメソッド
         */
        function swipeImage($element) {
            var start, end;

            $element.on('touchstart', function(event){
                clearInterval(autoTransition);
                event.preventDefault();
                start = event.originalEvent.touches[0].pageX;
            }).on('touchend', function(event){
                end = event.originalEvent.changedTouches[0].pageX;

                if (start >= end) { // 右隣の要素を表示
                    if (currentPhotoNumber === photoDatas.length - 1) {
                        var options = getFlickOptions(TEXT, PER_PAGE, ++currentPage);

                        isAjaxDone = false;
                        requestSearch(options).done(function(data){
                            generatePhotoDOM(data.photos.photo);
                            isAjaxDone = true;
                            nextImage(++currentPhotoNumber);
                        });
                    } else {
                        nextImage(++currentPhotoNumber);
                    }
                } else { // 左隣の要素を表示
                    if (currentPhotoNumber !== 0) {
                        nextImage(--currentPhotoNumber);
                    } else {
                        currentPhotoNumber = photoDatas.length - 1;
                    }
                }

                // transitionを再設定
                autoTransition = setInterval(transitionImage, AUTO_TRANSITION_TIME);
            });
        }

        function nextImage(number) {
            $('img', '#landscape').remove();
            $('#landscape').append(originalPhotos[number]);
            $('img', '#landscape').addClass('original fadeIn');
        }
    }

    /**
     * 縦画面のモード
     */
    function portraitMode() {
        $('#landscape').children().remove();
        offTouchEvent($('#container'));
        // $('img', '#portrait').css({'opacity': 1.0});

        $(window).on("scroll", function() {
            scrollHeight = $(document).height();
            scrollPosition = $(window).height() + $(window).scrollTop();

            if ( isAjaxDone &&
                ((scrollHeight - scrollPosition) / scrollHeight <= 0.1)
            ){
                var options = getFlickOptions(TEXT, PER_PAGE, ++currentPage);

                isAjaxDone = false;
                requestSearch(options).done(function(data){
                    generatePhotoDOM(data.photos.photo);
                    isAjaxDone = true;
                });
            }
        });

        function offTouchEvent($element) {
            $element.off('touchstart touchend');
        }
    }

    /**
     * 画像のDOM作成を行うメソッド
     */
    function generatePhotoDOM(photos) {
        var tag = "";
        $(photos).each(function(index){
            var thumbnail = getFlickrURL(this, "_m.jpg");
            var original = getFlickrURL(this, ".jpg");

            photoDatas.push(this);
            tag += "<img id='" + this.id + "' class='thumbnail' src='" + thumbnail + "' width='76' height='76' alt=''>";

            // originalサイズの画像は、landscapeMode, portraitMode両方で用いるため配列として保持する
            var image = new Image();
            image.src = original;
            image.name = this.id;
            originalPhotos.push(image);
        });

        $('#portrait').append(tag);
    }


    /**
     * thumbnailをクリックした時の動作をハンドリング
     */
    $('#portrait').on({
        'click': function(){
            // 拡大画像が表示されていれば、その画像を消す。
            if(isDisplayingOriginal) {
                $('.card').removeClass('fadeIn').addClass('fadeOut');
                $('.thumbnail').removeClass('toSkalton').addClass('fromSkalton');
                isDisplayingOriginal = false;
            // 拡大画像が表示されていなければ、クリックされたサムネイルの拡大画像を表示する。
            } else {
                toggleActiveOriginal($(this));
                $('.thumbnail').removeClass('fromSkalton').addClass('toSkalton');
                isDisplayingOriginal = true;
            }
        }
    }, '.thumbnail');

    $('#portrait').on({
        'animationend webkitAnimationEnd': function() {
            $(this).remove();
        }
    }, '.fadeOut');

    /**
     * 拡大画像をクリックした時の動作をハンドリング
     */
    $('#container').on({
        'click': function() {
            // 拡大画像を消す
            $('.card').removeClass('fadeIn').addClass('fadeOut');
            $('.thumbnail').removeClass('toSkalton').addClass('fromSkalton');
            isDisplayingOriginal = false;
        }
    }, '.card');


    /**
     *　現在表示している拡大画像を消し、指定された画像を描画するメソッド
     */
    function toggleActiveOriginal($self){
        $('.card').addClass('fadeOut').remove();

        var id = $self.attr('id');
        $(photoDatas).each(function(index){
            if(this.id === id) {
                var original = getFlickrURL(this, ".jpg");
                var photo = originalPhotos[index];

                $('#portrait').append('<div class="card"></div>');
                $('.card').append(photo);
                $('img', '.card').addClass('original');
                $('.card').center().addClass('fadeIn');

                currentPhotoNumber = index;
            }
        });
    }

}(window.jQuery, window, document));