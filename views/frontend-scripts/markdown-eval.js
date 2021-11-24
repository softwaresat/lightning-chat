function evalMarkdown(count) {

 
  function convertToHtml(msg) {
    var converter = new showdown.Converter({extensions: ['targetblank'],simplifiedAutoLink: 'true'});
    html = converter.makeHtml(msg);
    return html;
  }
  if (count == null) {   
    var toConvert = document.getElementsByClassName('toConvert');
    for (var i = 0; i < toConvert.length; i++) {

      html = convertToHtml(toConvert[i].innerText);
    toConvert[0].innerHTML =html.replace(/<\/?p[^>]*>/g,"");
    }
  } else {
    var toConvert = document.getElementById(count.toString()).getElementsByClassName('toConvert');
    if(!toConvert[0].innerText.replace(/<\/?p[^>]*>/g,"").startsWith("<img")){
    html = convertToHtml(toConvert[0].innerText.replace(/<\/?p[^>]*>/g,""));
    toConvert[0].innerHTML =html.replace(/<\/?p[^>]*>/g,"");


  }

  }

}