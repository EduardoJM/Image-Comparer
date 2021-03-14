# Image Comparer

This component is created (in the first time, based on MetroUI component code) for my personal use in my materialize pages. The component visual is see in the image below.

![Alternative](docs/images/demo/preview.jpg)

## Getting Started

### Add reference for JavaScript and CSS

Includes the image comparer css and javascript.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/EduardoJM/Image-Comparer@1.0.3/dist/css/image-comparer.min.css" />
    <title>Document</title>
</head>
<body>

    
    <script src="https://cdn.jsdelivr.net/gh/EduardoJM/Image-Comparer@1.0.3/dist/js/image-comparer.min.js"></script>
</body>
</html>
```

### Add the Component Markup

```html
<div class="image-compare">
    <img src="./images/comparer-1.jpg">
    <img src="./images/comparer-2.jpg">
</div>
```

### Initialize via JavaScript

```javascript
var el = document.querySelector('.image-compare');
var comp = new ImageCompare(el, options);
```

For more informations see the [documentation](https://eduardojm.github.io/Image-Comparer/) (the documentation is in development for now, then sorry for bad explained things for now).

## Building

In the `./dist/` folder has a builded distribution of the javascript and the css. The source javascript and sass files is disponible in the `./src/` folder and can be builded using the gulp.

### Clone the Repository

```bash
git clone https://github.com/EduardoJM/Image-Comparer.git
cd Image-Comparer
```

### Install Dependencies

```bash
npm install 
```

### Run Gulp Task(s)

To build the sass and the javascript files, run the tasks:

```bash
gulp sass
gulp js
```

If you want to watch for javascript source files modification, use the task:

```bash
gulp watchJS
```

And if you want to watch for sass source files modification, use the task:

```bash
gulp watchSASS
```