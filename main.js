const medal_size = 180;
const canvas_cropped = document.getElementById("canvas-cropped"); canvas_cropped.width = canvas_cropped.height = medal_size;
const img_input = document.getElementById("img-crop");
const img_effect = document.getElementById("effect"); img_effect.width = img_effect.height = medal_size;
const img_output = document.getElementById("output"); img_output.width = img_output.height = medal_size;
const img_output_apng = document.getElementById("output_apng"); img_output_apng.width = img_output_apng.height = medal_size;
const input_effect = document.getElementById("open-effect");
const input_img = document.getElementById("open-image");
const ctx_cropped = canvas_cropped.getContext('2d');
const input_anime_delay = document.getElementById('anime-delay');
var hasCroppedInput = false;
var hasEffect = true;
var cropper = null;
function OpenImage() {
    let f = input_img.files[0];
    let u = window.URL.createObjectURL(f);
    img_input.src = u;
    cropper = new Cropper(img_input, { aspectRatio: 1 })
}
function OpenEffect() {
    let f = input_effect.files[0];
    let u = window.URL.createObjectURL(f);
    img_effect.onload = function () { hasEffect = true; TryCreateMedal() }
    img_effect.src = u;
}
function Crop() {
    if (cropper == null) return;
    let src = cropper.getCroppedCanvas();
    FillCircle(ctx_cropped, src);
    hasCroppedInput = true;
    TryCreateMedal()
}
function TryCreateMedal() {
    if (hasCroppedInput && hasEffect) CreateMedal();
}
const canvas_temp = document.createElement("canvas");
canvas_temp.id = "temp";
canvas_temp.width = medal_size;
canvas_temp.height = medal_size;
const ctx_canvas_temp = canvas_temp.getContext('2d');
document.body.appendChild(canvas_temp);
function CreateMedal() {
    let gifReader = new SuperGif({ gif: img_effect });
    let gifWriter = new GIF({
        workers: 2,
        quality: 1,
        transparent: "rgba(0,0,0,0)",
    });
    gifWriter.on('finished', function (blob) {
        img_output.src = URL.createObjectURL(blob)
    });
    let apngWriter = new APNGencoder(canvas_temp);
    apngWriter.start();
    gifReader.load(function () {
        gifReader.pause();
        let ctx = ctx_canvas_temp;
        let frameLength = gifReader.get_length();
        let delay = parseInt(input_anime_delay.value);
        apngWriter.setDelay(delay/10);
        for (let i = 0; i < frameLength; i++) {
            gifReader.move_to(i);
            ctx.clearRect(0, 0, medal_size, medal_size);
            ctx.drawImage(canvas_cropped, 0, 0);
            FillCircle(ctx, gifReader.get_canvas())
            gifWriter.addFrame(canvas_temp, { delay: delay, copy: true });
            apngWriter.addFrame(canvas_temp);
        }
        apngWriter.finish();
        gifWriter.render();
        gifReader.play();
        let base64Out = bytesToBase64(apngWriter.stream().bin);
        img_output_apng.src = "data:image/png;base64," + base64Out;
    });

}


function FillCircle(ctx, src) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(medal_size / 2, medal_size / 2, medal_size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(src, 0, 0, medal_size, medal_size);
    ctx.beginPath();
    ctx.arc(0, 0, medal_size / 2, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.closePath();
    ctx.restore();
}