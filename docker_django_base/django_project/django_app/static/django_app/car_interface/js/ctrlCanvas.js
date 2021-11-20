/**
 * canvas 생성
 */
 var canvas = this.__canvas = new fabric.Canvas('c', { 
    selection: true,
    width: '800',
    height: '450'
})

//interfaceApp.canvas.me = canvas

const imgElement = document.querySelector('#tmpImage')

function clearCanvas() {

    canvas.discardActiveObject();
    var sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
    });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();

    canvas.getActiveObjects().forEach((obj) => {
        canvas.remove(obj)
    })
    canvas.discardActiveObject().renderAll()
}