# 🤓 Meme Creator

A modern, responsive web-based meme generator that lets you create hilarious memes with ease! Built with vanilla JavaScript, Fabric.js, and Bootstrap.

## ✨ Features

### 🖼️ Image Handling
- **Drag & Drop Upload** - Simply drag an image onto the canvas
- **File Browser** - Traditional file selection support
- **Format Support** - JPG, PNG, WebP, and GIF images
- **Auto-scaling** - Images automatically fit the canvas while maintaining aspect ratio

### ✏️ Text Editing
- **Default Text Boxes** - Pre-positioned top and bottom text areas
- **Custom Text** - Add unlimited additional text boxes anywhere
- **Live Editing** - Click any text to edit directly on canvas
- **Auto Uppercase** - Classic meme-style text formatting

### 🎨 Text Styling
- **Font Size Control** - Adjustable from 20px to 120px
- **Color Customization** - Full color picker for text and outline
- **Text Outline** - Toggle-able stroke with customizable color
- **Text Shadow** - Add depth with optional drop shadows
- **Text Rotation** - Rotate text from -45° to +45°

### 🖼️ Image Filters
- **Brightness Control** - Adjust image brightness (-100 to +100)
- **Contrast Control** - Modify image contrast (-100 to +100)
- **Filter Reset** - One-click reset to original image

### 🔧 Canvas Tools
- **Undo/Redo** - Full history management (up to 20 steps)
- **Object Selection** - Click to select and modify any element
- **Center Text** - One-click horizontal centering
- **Delete Objects** - Remove selected text or clear content
- **Clear All** - Reset all text content

### 📱 Mobile Experience
- **Responsive Design** - Works perfectly on all screen sizes
- **Touch-Friendly** - Optimized for mobile interaction
- **Offcanvas Controls** - Slide-out control panel on mobile
- **Safe Area Support** - Respects device notches and home indicators

### 💾 Export & Share
- **PNG Download** - High-quality image export
- **Web Share API** - Native sharing on supported devices
- **FileSaver Integration** - Reliable download functionality

### No Build Process Required!
This project uses vanilla JavaScript and CDN-hosted libraries, so there's no build step or package installation needed.

## 📖 Usage

### Basic Meme Creation

1. **Add an Image**
   - Drag & drop an image onto the canvas, OR
   - Click "Select Image" to browse files

2. **Add Text**
   - Type in the "Top Text" and "Bottom Text" fields
   - Or click "Add Text" to create custom text boxes

3. **Style Your Text**
   - Adjust font size with the slider
   - Change colors using the color pickers
   - Toggle outline and shadow effects
   - Rotate text for creative angles

4. **Fine-tune the Image**
   - Adjust brightness and contrast
   - Use undo/redo for experimentation

5. **Export Your Meme**
   - Click "Save" to download as PNG
   - Click "Share" to use native sharing (mobile)

### Advanced Features

- **Text Positioning**: Click and drag any text box to reposition
- **Object Selection**: Click any text to select and modify it
- **Keyboard Shortcuts**: Standard copy/paste/undo work
- **Mobile Editing**: Use the hamburger menu for full controls on mobile

## 🛠️ Technologies Used

- **Frontend Framework**: Vanilla JavaScript (ES6+)
- **Canvas Library**: [Fabric.js v5.3.0](http://fabricjs.com/)
- **UI Framework**: [Bootstrap 5.3.2](https://getbootstrap.com/)
- **File Operations**: [FileSaver.js v2.0.5](https://github.com/eligrey/FileSaver.js/)
- **Fonts**: Google Fonts (Impact for classic meme styling)
- **Icons**: Unicode Emojis for universal compatibility

## 🏗️ Project Structure

```
meme-creator/
├── index.html          # Main HTML structure
├── style.css           # Custom styles and responsive design
├── main.js             # Core application logic
├── README.md           # This file
└── LICENSE             # MIT License
```

## 🎯 Browser Support

- **Chrome/Edge**: Full support including Web Share API
- **Firefox**: Full support (no Web Share API)
- **Safari**: Full support including Web Share API
- **Mobile Browsers**: Optimized experience on iOS/Android

## 🤝 Contributing

Contributions are welcome! Contact me for any questions!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Fabric.js](http://fabricjs.com/) for powerful canvas manipulation
- [Bootstrap](https://getbootstrap.com/) for responsive UI components
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) for reliable file downloads
- The meme community for inspiration! 🎭

---

**Made with ❤️ for the meme community**

*Happy meme making! 🎉* 