
var upload_button = document.getElementById("upload_btn");
upload_button.addEventListener('click', function(e){
    if(uploading) return alert('업로드하고 있습니다.')
    UploadFile(); 
});

var uploading = false

const product_img = document.getElementById('product_img')
const img_name = document.getElementById('image_id')
const final_name = document.getElementById('final_id')
const prepend_btn = document.getElementById('pre_btn')
const next_btn = document.getElementById('next_btn')

function UploadFile() {
    var data = new FormData();
    // 비디오 데이터를 업로드 하려면 Form 형식으로 데이터를 업로드 받아야 함
    data.append("file", $("input[id^='file']")[0].files[0]);
    uploading = true

    var file_name = data.get('file').name;

    $.ajax({
        url: window.location.href,
        // url : '/upload/',
        type: "POST",
        processData: false, 
        contentType: false,
        mimeType: "multipart/form-data",
        data: data,

        error : function(){
            uploading = false
            alert("Failed Upload!");
            
        },

        success: function(data) {
            uploading = false;

            console.log("Data Check : ", data)
            console.log("File_Name : ",file_name)

            only_file_name = file_name.split('.')[0]
            
            alert("Complete Upload!!");

            // context.clearRect(0,0,canvas.width, canvas.height)
            // context.beginPath()

            img_count_start = 0
            img_count_end = data

            final_count_end = data - 1
          
            base_image_path = '/media/django_app/images/' + only_file_name
            // product_img.src = '/media/images/0.jpg'
            product_img.src = base_image_path + '/' + img_count_start + '.jpg'
            img_name.innerText = img_count_start + '.jpg'
            final_name.innerText = "last image number : " + final_count_end + '.jpg'

            function_btn(img_count_start, img_count_end)
     
            // $('#hidden_filepath_container').html("<input type='hidden' id = 'hidden_filepath' name = 'hidden_filepath' value ='media/django_app/audio_file/" + file_name + "' >")
            // $('#upload_btn').prop('disabled', true);
            // $('#file').prop('disabled', true);
            // $('#play_button').removeAttr('hidden');
            // $('#play_button').attr('disabled', false);
            // $('#audio_mute').removeAttr('hidden');
            
        }
    });
}


function function_btn(image_count_start, image_count_end){

    var start = image_count_start
    var end = image_count_end

    prepend_btn.addEventListener('click', function(e){

        console.log(start)
        console.log(end)

        console.log("prepend_btn Activate")
    
        if (start == null) {
            alert (" No Image")
        }
        if (start <= 0){
            start = 0
        }else {
            start -= 1
        }
    
        base_image_path = '/media/django_app/images/' + only_file_name
        // product_img.src = '/media/images/0.jpg'
        product_img.src = base_image_path + '/' + start + '.jpg'
        img_name.innerText = start + '.jpg'
    
        
    })
    
    next_btn.addEventListener('click', function(e){

        console.log(start)
        console.log(end)
    
        console.log("Next Btn Activate")
        if(start == null){
            alert("No Image")
    
        }
        if(start >= (end - 1)){
            start = end - 1
    
        }else{
            start +=1
        }
    
        base_image_path = '/media/django_app/images/' + only_file_name
        // product_img.src = '/media/images/0.jpg'
        product_img.src = base_image_path + '/' + start + '.jpg'
        img_name.innerText = start + '.jpg'
    })

};
