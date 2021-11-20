(function(){
        var toolbarOptions = [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          ['blockquote', 'code-block'],

          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction

          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],

          ['clean']                                         // remove formatting button
        ]

        var quill = new Quill('#editor', {
          theme: 'snow',
          modules: {
              toolbar: toolbarOptions
          },
        })

        var form = document.forms.writeForm

        var myEditor = document.querySelector('#editor')

        form.addEventListener('submit', function(e){
            e.preventDefault()
            form.editor.value = myEditor.children[0].innerHTML
            form.submit()
        })

        if(document.forms.writeForm.editor){
            const value = document.forms.writeForm.editor.value
            const delta = quill.clipboard.convert(value)

            quill.setContents(delta, 'silent')

            console.log(document.forms.writeForm.editor.value)
        }
}())