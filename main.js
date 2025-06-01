/**
 * MEME GENERATOR - MAIN JAVASCRIPT
 * 
 * This file contains all the logic for the meme generator:
 * - Fabric.js canvas initialization and management
 * - Image upload and drag-and-drop handling
 * - Text layer creation and manipulation
 * - Controls panel interactions
 * - Export functionality
 * - Bootstrap native responsive behavior
 */

// Global variables to manage application state
let canvas; // Main Fabric.js canvas instance
let backgroundImage = null; // Reference to the background image object
let topTextBox = null; // Reference to top text object
let bottomTextBox = null; // Reference to bottom text object
let currentSelectedText = null; // Currently selected text object for styling
let canvasHistory = []; // Canvas state history for undo/redo
let historyStep = -1; // Current position in history
let allTextBoxes = []; // Track all text boxes for management

// Configuration constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const DEFAULT_FONT_SIZE = 60;
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_STROKE_COLOR = '#000000';
const DEFAULT_STROKE_WIDTH = 2;

// DOM element references (cached for performance)
const elements = {
    canvas: null,
    dropHint: null,
    imageInput: null,
    selectImageBtn: null,
    topTextInput: null,
    bottomTextInput: null,
    fontSizeSlider: null,
    fontSizeValue: null,
    textColorPicker: null,
    strokeColorPicker: null,
    outlineToggle: null,
    centerHorizontalBtn: null,
    deleteSelectedBtn: null,
    downloadBtn: null,
    controlsContent: null,
    mobileControls: null,
    // New elements
    addTextBtn: null,
    shadowToggle: null,
    rotationSlider: null,
    rotationValue: null,
    brightnessSlider: null,
    brightnessValue: null,
    contrastSlider: null,
    contrastValue: null,
    resetFiltersBtn: null,
    undoBtn: null,
    redoBtn: null,
    clearAllBtn: null,
    // Canvas action elements
    canvasActions: null,
    saveBtn: null,
    shareBtn: null
};

/**
 * Initialize the meme generator when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeCanvas();
    setupEventListeners();
    setupMobileControls();
    setupResponsiveCanvas();
    
    console.log('🎉 Meme Creator initialized successfully!');
});

/**
 * Cache all DOM element references for better performance
 */
function initializeElements() {
    elements.canvas = document.getElementById('memeCanvas');
    elements.dropHint = document.getElementById('dropHint');
    elements.imageInput = document.getElementById('imageInput');
    elements.selectImageBtn = document.getElementById('selectImageBtn');
    elements.topTextInput = document.getElementById('topTextInput');
    elements.bottomTextInput = document.getElementById('bottomTextInput');
    elements.fontSizeSlider = document.getElementById('fontSizeSlider');
    elements.fontSizeValue = document.getElementById('fontSizeValue');
    elements.textColorPicker = document.getElementById('textColorPicker');
    elements.strokeColorPicker = document.getElementById('strokeColorPicker');
    elements.outlineToggle = document.getElementById('outlineToggle');
    elements.centerHorizontalBtn = document.getElementById('centerHorizontalBtn');
    elements.deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    elements.downloadBtn = document.getElementById('downloadBtn');
    elements.controlsContent = document.getElementById('controls-content');
    elements.mobileControls = document.getElementById('controls-mobile');
    
    // New elements
    elements.addTextBtn = document.getElementById('addTextBtn');
    elements.shadowToggle = document.getElementById('shadowToggle');
    elements.rotationSlider = document.getElementById('rotationSlider');
    elements.rotationValue = document.getElementById('rotationValue');
    elements.brightnessSlider = document.getElementById('brightnessSlider');
    elements.brightnessValue = document.getElementById('brightnessValue');
    elements.contrastSlider = document.getElementById('contrastSlider');
    elements.contrastValue = document.getElementById('contrastValue');
    elements.resetFiltersBtn = document.getElementById('resetFiltersBtn');
    elements.undoBtn = document.getElementById('undoBtn');
    elements.redoBtn = document.getElementById('redoBtn');
    elements.clearAllBtn = document.getElementById('clearAllBtn');
    
    // Canvas action elements
    elements.canvasActions = document.getElementById('canvasActions');
    elements.saveBtn = document.getElementById('saveBtn');
    elements.shareBtn = document.getElementById('shareBtn');
}

/**
 * Initialize Fabric.js canvas with responsive dimensions
 */
function initializeCanvas() {
    // Get responsive canvas dimensions
    const { width, height } = getResponsiveCanvasDimensions();
    
    // Create new Fabric.js canvas instance
    canvas = new fabric.Canvas('memeCanvas', {
        width: width,
        height: height,
        backgroundColor: '#ffffff',
        selection: true, // Allow object selection
        preserveObjectStacking: true // Maintain layer order
    });
    
    // Create default text objects (hidden initially)
    createDefaultTextObjects();
    
    // Hide text boxes initially - they'll show when image is loaded
    hideTextBoxes();
    
    // Canvas event listeners for object selection
    canvas.on('selection:created', handleObjectSelection);
    canvas.on('selection:updated', handleObjectSelection);
    canvas.on('selection:cleared', function() {
        currentSelectedText = null;
        updateControlsForSelection();
    });
    
    // Save initial state for undo/redo
    saveCanvasState();
    
    console.log('Canvas initialized with dimensions:', width, 'x', height);
}

/**
 * Hide text boxes until image is loaded
 */
function hideTextBoxes() {
    if (topTextBox) {
        topTextBox.set('visible', false);
    }
    if (bottomTextBox) {
        bottomTextBox.set('visible', false);
    }
    canvas.renderAll();
}

/**
 * Show text boxes when image is loaded
 */
function showTextBoxes() {
    if (topTextBox) {
        topTextBox.set('visible', true);
    }
    if (bottomTextBox) {
        bottomTextBox.set('visible', true);
    }
    canvas.renderAll();
}

/**
 * Get responsive canvas dimensions based on screen size
 */
function getResponsiveCanvasDimensions() {
    const isMobile = window.innerWidth <= 991;
    
    if (isMobile) {
        const canvasArea = document.querySelector('.canvas-area .flex-fill');
        if (canvasArea) {
            const rect = canvasArea.getBoundingClientRect();
            const availableWidth = rect.width - 32; // Account for padding
            const availableHeight = rect.height - 32; // Account for padding
            
            // Maintain 4:3 aspect ratio but fit in available space
            const aspectRatio = 4 / 3;
            let width, height;
            
            if (availableWidth / availableHeight > aspectRatio) {
                height = availableHeight;
                width = height * aspectRatio;
            } else {
                width = availableWidth;
                height = width / aspectRatio;
            }
            
            return {
                width: Math.max(300, Math.floor(width)),
                height: Math.max(225, Math.floor(height))
            };
        }
    }
    
    // Desktop dimensions
    return {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT
    };
}

/**
 * Setup responsive canvas behavior
 */
function setupResponsiveCanvas() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const { width, height } = getResponsiveCanvasDimensions();
            
            if (canvas.width !== width || canvas.height !== height) {
                canvas.setDimensions({ width, height });
                
                // Reposition text objects for new dimensions
                updateTextPositionsForNewCanvas(width, height);
                
                // Rescale background image if exists
                if (backgroundImage) {
                    rescaleBackgroundImage(width, height);
                }
                
                canvas.renderAll();
                console.log('Canvas resized to:', width, 'x', height);
            }
        }, 250);
    });
}

/**
 * Update text positions when canvas size changes
 */
function updateTextPositionsForNewCanvas(width, height) {
    if (topTextBox) {
        topTextBox.set({
            left: width / 2,
            top: height * 0.05,
            width: width * 0.9
        });
    }
    
    if (bottomTextBox) {
        bottomTextBox.set({
            left: width / 2,
            top: height * 0.85,
            width: width * 0.9
        });
    }
}

/**
 * Rescale background image for new canvas dimensions
 */
function rescaleBackgroundImage(canvasWidth, canvasHeight) {
    if (!backgroundImage) return;
    
    const scaleX = canvasWidth / backgroundImage.width;
    const scaleY = canvasHeight / backgroundImage.height;
    const scale = Math.min(scaleX, scaleY);
    
    const finalWidth = backgroundImage.width * scale;
    const finalHeight = backgroundImage.height * scale;
    
    const offsetX = (canvasWidth - finalWidth) / 2;
    const offsetY = (canvasHeight - finalHeight) / 2;
    
    backgroundImage.set({
        left: offsetX,
        top: offsetY,
        scaleX: scale,
        scaleY: scale
    });
}

/**
 * Create the default top and bottom text objects
 */
function createDefaultTextObjects() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Top text - positioned at 5% from top, centered
    topTextBox = new fabric.Textbox('', {
        left: canvasWidth / 2,
        top: canvasHeight * 0.05,
        width: canvasWidth * 0.9,
        fontFamily: 'Impact',
        fontSize: DEFAULT_FONT_SIZE,
        fill: DEFAULT_TEXT_COLOR,
        stroke: DEFAULT_STROKE_COLOR,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        textAlign: 'center',
        originX: 'center',
        originY: 'top',
        selectable: true,
        editable: true,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: true, // Maintain aspect ratio when scaling
        visible: false // Hidden initially
    });
    
    // Bottom text - positioned at 85% from top, centered
    bottomTextBox = new fabric.Textbox('', {
        left: canvasWidth / 2,
        top: canvasHeight * 0.85,
        width: canvasWidth * 0.9,
        fontFamily: 'Impact',
        fontSize: DEFAULT_FONT_SIZE,
        fill: DEFAULT_TEXT_COLOR,
        stroke: DEFAULT_STROKE_COLOR,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        textAlign: 'center',
        originX: 'center',
        originY: 'bottom',
        selectable: true,
        editable: true,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: true,
        visible: false // Hidden initially
    });
    
    // Add text objects to canvas
    canvas.add(topTextBox);
    canvas.add(bottomTextBox);
    
    // Track all text boxes
    allTextBoxes = [topTextBox, bottomTextBox];
    
    console.log('Default text objects created (hidden until image loaded)');
}

/**
 * Setup mobile controls using Bootstrap's native approach
 */
function setupMobileControls() {
    if (elements.mobileControls && elements.controlsContent) {
        // Clone the desktop controls content for mobile
        const desktopControls = elements.controlsContent.cloneNode(true);
        
        // Update IDs to avoid conflicts
        updateMobileControlIds(desktopControls);
        
        // Clear and populate mobile controls
        elements.mobileControls.innerHTML = '';
        elements.mobileControls.appendChild(desktopControls);
        
        // Setup event listeners for mobile controls
        setupMobileEventListeners();
        
        console.log('Bootstrap native mobile controls setup complete');
    }
}

/**
 * Update IDs for mobile controls to avoid conflicts
 */
function updateMobileControlIds(container) {
    const elementsWithIds = container.querySelectorAll('[id]');
    elementsWithIds.forEach(element => {
        const oldId = element.id;
        const newId = 'mobile-' + oldId;
        element.id = newId;
        
        // Update associated labels
        const labels = container.querySelectorAll(`label[for="${oldId}"]`);
        labels.forEach(label => {
            label.setAttribute('for', newId);
        });
    });
}

/**
 * Setup event listeners for mobile controls with Bootstrap synchronization
 */
function setupMobileEventListeners() {
    // Get mobile control elements
    const mobileElements = {
        selectImageBtn: document.getElementById('mobile-selectImageBtn'),
        topTextInput: document.getElementById('mobile-topTextInput'),
        bottomTextInput: document.getElementById('mobile-bottomTextInput'),
        fontSizeSlider: document.getElementById('mobile-fontSizeSlider'),
        fontSizeValue: document.getElementById('mobile-fontSizeValue'),
        textColorPicker: document.getElementById('mobile-textColorPicker'),
        strokeColorPicker: document.getElementById('mobile-strokeColorPicker'),
        outlineToggle: document.getElementById('mobile-outlineToggle'),
        addTextBtn: document.getElementById('mobile-addTextBtn'),
        shadowToggle: document.getElementById('mobile-shadowToggle'),
        rotationSlider: document.getElementById('mobile-rotationSlider'),
        rotationValue: document.getElementById('mobile-rotationValue'),
        brightnessSlider: document.getElementById('mobile-brightnessSlider'),
        brightnessValue: document.getElementById('mobile-brightnessValue'),
        contrastSlider: document.getElementById('mobile-contrastSlider'),
        contrastValue: document.getElementById('mobile-contrastValue'),
        resetFiltersBtn: document.getElementById('mobile-resetFiltersBtn'),
        undoBtn: document.getElementById('mobile-undoBtn'),
        redoBtn: document.getElementById('mobile-redoBtn'),
        clearAllBtn: document.getElementById('mobile-clearAllBtn'),
        centerHorizontalBtn: document.getElementById('mobile-centerHorizontalBtn'),
        deleteSelectedBtn: document.getElementById('mobile-deleteSelectedBtn'),
        downloadBtn: document.getElementById('mobile-downloadBtn')
    };

    // Setup mobile event listeners that sync with desktop
    if (mobileElements.selectImageBtn) {
        mobileElements.selectImageBtn.addEventListener('click', () => elements.imageInput.click());
    }

    if (mobileElements.topTextInput) {
        mobileElements.topTextInput.addEventListener('input', function() {
            elements.topTextInput.value = this.value;
            const upperText = this.value.toUpperCase();
            topTextBox.set('text', upperText);
            canvas.renderAll();
            saveCanvasState();
        });
    }

    if (mobileElements.bottomTextInput) {
        mobileElements.bottomTextInput.addEventListener('input', function() {
            elements.bottomTextInput.value = this.value;
            const upperText = this.value.toUpperCase();
            bottomTextBox.set('text', upperText);
            canvas.renderAll();
            saveCanvasState();
        });
    }

    if (mobileElements.fontSizeSlider) {
        mobileElements.fontSizeSlider.addEventListener('input', function() {
            const fontSize = parseInt(this.value);
            elements.fontSizeSlider.value = fontSize;
            elements.fontSizeValue.textContent = fontSize;
            mobileElements.fontSizeValue.textContent = fontSize;
            
            if (currentSelectedText) {
                currentSelectedText.set('fontSize', fontSize);
                canvas.renderAll();
                saveCanvasState();
            }
        });
    }

    // Add event listeners for all other mobile controls
    Object.keys(mobileElements).forEach(key => {
        const mobileElement = mobileElements[key];
        const desktopElement = elements[key.replace('mobile-', '')];
        
        if (mobileElement && desktopElement && key.includes('Btn')) {
            // Button controls
            mobileElement.addEventListener('click', function() {
                desktopElement.click();
            });
        }
    });

    console.log('Mobile event listeners with Bootstrap sync setup complete');
}

/**
 * Set up all event listeners for user interactions
 */
function setupEventListeners() {
    // Image selection and drag-and-drop
    elements.selectImageBtn.addEventListener('click', () => elements.imageInput.click());
    elements.imageInput.addEventListener('change', handleImageUpload);
    elements.dropHint.addEventListener('click', () => elements.imageInput.click());
    
    // Drag and drop on canvas area
    const canvasArea = document.querySelector('.canvas-area');
    canvasArea.addEventListener('dragover', handleDragOver);
    canvasArea.addEventListener('drop', handleImageDrop);
    canvasArea.addEventListener('dragenter', handleDragEnter);
    canvasArea.addEventListener('dragleave', handleDragLeave);
    
    // Text input live binding - convert to uppercase automatically
    elements.topTextInput.addEventListener('input', function() {
        const upperText = this.value.toUpperCase();
        topTextBox.set('text', upperText);
        canvas.renderAll();
        saveCanvasState();
        syncMobileControl('topTextInput', this.value);
    });
    
    elements.bottomTextInput.addEventListener('input', function() {
        const upperText = this.value.toUpperCase();
        bottomTextBox.set('text', upperText);
        canvas.renderAll();
        saveCanvasState();
        syncMobileControl('bottomTextInput', this.value);
    });
    
    // Font size slider with live preview
    elements.fontSizeSlider.addEventListener('input', function() {
        const fontSize = parseInt(this.value);
        elements.fontSizeValue.textContent = fontSize;
        
        // Apply to currently selected text object
        if (currentSelectedText) {
            currentSelectedText.set('fontSize', fontSize);
            canvas.renderAll();
            saveCanvasState();
        }
        syncMobileControl('fontSizeSlider', fontSize);
        syncMobileControl('fontSizeValue', fontSize, 'textContent');
    });
    
    // Color pickers for text and stroke
    elements.textColorPicker.addEventListener('change', function() {
        if (currentSelectedText) {
            currentSelectedText.set('fill', this.value);
            canvas.renderAll();
            saveCanvasState();
        }
        syncMobileControl('textColorPicker', this.value);
    });
    
    elements.strokeColorPicker.addEventListener('change', function() {
        if (currentSelectedText) {
            currentSelectedText.set('stroke', this.value);
            canvas.renderAll();
            saveCanvasState();
        }
        syncMobileControl('strokeColorPicker', this.value);
    });
    
    // Outline toggle checkbox
    elements.outlineToggle.addEventListener('change', function() {
        if (currentSelectedText) {
            const strokeWidth = this.checked ? DEFAULT_STROKE_WIDTH : 0;
            currentSelectedText.set('strokeWidth', strokeWidth);
            canvas.renderAll();
            saveCanvasState();
        }
        syncMobileControl('outlineToggle', this.checked, 'checked');
    });
    
    // NEW FEATURES EVENT LISTENERS
    
    // Add text button
    elements.addTextBtn.addEventListener('click', addNewTextBox);
    
    // Text shadow toggle
    elements.shadowToggle.addEventListener('change', function() {
        if (currentSelectedText) {
            if (this.checked) {
                currentSelectedText.set('shadow', {
                    color: 'rgba(0,0,0,0.6)',
                    blur: 3,
                    offsetX: 2,
                    offsetY: 2
                });
            } else {
                currentSelectedText.set('shadow', null);
            }
            canvas.renderAll();
            saveCanvasState();
        }
        syncMobileControl('shadowToggle', this.checked, 'checked');
    });
    
    // Text rotation slider
    elements.rotationSlider.addEventListener('input', function() {
        const rotation = parseInt(this.value);
        elements.rotationValue.textContent = rotation;
        
        if (currentSelectedText) {
            currentSelectedText.set('angle', rotation);
            canvas.renderAll();
            saveCanvasState();
        }
        syncMobileControl('rotationSlider', rotation);
        syncMobileControl('rotationValue', rotation, 'textContent');
    });
    
    // Image filters
    elements.brightnessSlider.addEventListener('input', function() {
        const brightness = parseInt(this.value);
        elements.brightnessValue.textContent = brightness;
        applyImageFilters();
        syncMobileControl('brightnessSlider', brightness);
        syncMobileControl('brightnessValue', brightness, 'textContent');
    });
    
    elements.contrastSlider.addEventListener('input', function() {
        const contrast = parseInt(this.value);
        elements.contrastValue.textContent = contrast;
        applyImageFilters();
        syncMobileControl('contrastSlider', contrast);
        syncMobileControl('contrastValue', contrast, 'textContent');
    });
    
    elements.resetFiltersBtn.addEventListener('click', resetImageFilters);
    
    // Undo/Redo buttons
    elements.undoBtn.addEventListener('click', undo);
    elements.redoBtn.addEventListener('click', redo);
    
    // Clear all text button
    elements.clearAllBtn.addEventListener('click', clearAllText);
    
    // Position and utility buttons
    elements.centerHorizontalBtn.addEventListener('click', centerSelectedTextHorizontally);
    elements.deleteSelectedBtn.addEventListener('click', deleteSelectedObject);
    elements.downloadBtn.addEventListener('click', downloadMeme);
    
    // Canvas action buttons
    elements.saveBtn.addEventListener('click', downloadMeme); // Same functionality as download
    elements.shareBtn.addEventListener('click', shareMeme);
    
    console.log('Desktop event listeners set up');
}

/**
 * Sync desktop control changes with mobile controls
 */
function syncMobileControl(controlName, value, property = 'value') {
    const mobileElement = document.getElementById('mobile-' + controlName);
    if (mobileElement) {
        if (property === 'textContent') {
            mobileElement.textContent = value;
        } else {
            mobileElement[property] = value;
        }
    }
}

/**
 * Handle object selection on canvas to update controls
 */
function handleObjectSelection(e) {
    const activeObject = e.selected[0] || e.target;
    
    // Only update controls for text objects
    if (activeObject && activeObject.type === 'textbox') {
        currentSelectedText = activeObject;
        updateControlsForSelection();
    }
}

/**
 * Update control panel values based on selected text object
 */
function updateControlsForSelection() {
    if (!currentSelectedText) return;
    
    // Update font size slider
    const fontSize = currentSelectedText.fontSize;
    elements.fontSizeSlider.value = fontSize;
    elements.fontSizeValue.textContent = fontSize;
    syncMobileControl('fontSizeSlider', fontSize);
    syncMobileControl('fontSizeValue', fontSize, 'textContent');
    
    // Update color pickers
    elements.textColorPicker.value = currentSelectedText.fill;
    elements.strokeColorPicker.value = currentSelectedText.stroke;
    syncMobileControl('textColorPicker', currentSelectedText.fill);
    syncMobileControl('strokeColorPicker', currentSelectedText.stroke);
    
    // Update outline toggle
    elements.outlineToggle.checked = currentSelectedText.strokeWidth > 0;
    syncMobileControl('outlineToggle', currentSelectedText.strokeWidth > 0, 'checked');
    
    // Update new controls
    elements.shadowToggle.checked = !!currentSelectedText.shadow;
    syncMobileControl('shadowToggle', !!currentSelectedText.shadow, 'checked');
    
    const rotation = currentSelectedText.angle || 0;
    elements.rotationSlider.value = rotation;
    elements.rotationValue.textContent = rotation;
    syncMobileControl('rotationSlider', rotation);
    syncMobileControl('rotationValue', rotation, 'textContent');
}

/**
 * Handle drag over event for drag-and-drop
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

/**
 * Handle drag enter event - show visual feedback
 */
function handleDragEnter(e) {
    e.preventDefault();
    elements.dropHint.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
    elements.dropHint.style.borderColor = '#007bff';
}

/**
 * Handle drag leave event - reset visual feedback
 */
function handleDragLeave(e) {
    e.preventDefault();
    elements.dropHint.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    elements.dropHint.style.borderColor = '#666';
}

/**
 * Handle image drop event
 */
function handleImageDrop(e) {
    e.preventDefault();
    
    // Reset drag visual feedback
    handleDragLeave(e);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isValidImageFile(file)) {
            loadImageToCanvas(file);
        } else {
            console.warn('Please drop a valid image file (.jpg, .png, .webp, .gif)');
        }
    }
}

/**
 * Handle image upload from file input
 */
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && isValidImageFile(file)) {
        loadImageToCanvas(file);
    } else if (file) {
        console.warn('Please select a valid image file (.jpg, .png, .webp, .gif)');
    }
}

/**
 * Validate if file is a supported image type
 */
function isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    return validTypes.includes(file.type);
}

/**
 * Load image file to canvas as background with improved scaling
 */
function loadImageToCanvas(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        fabric.Image.fromURL(e.target.result, function(img) {
            try {
                // Remove existing background image
                if (backgroundImage) {
                    canvas.remove(backgroundImage);
                }
                
                // Get current canvas dimensions
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                
                // Calculate scaling to fill the canvas completely
                const scaleX = canvasWidth / img.width;
                const scaleY = canvasHeight / img.height;
                const scale = Math.max(scaleX, scaleY); // Use max for fill, min for fit
                
                // Calculate final dimensions
                const finalWidth = img.width * scale;
                const finalHeight = img.height * scale;
                
                // Center the image on the canvas
                const offsetX = (canvasWidth - finalWidth) / 2;
                const offsetY = (canvasHeight - finalHeight) / 2;
                
                // Set image properties
                img.set({
                    left: offsetX,
                    top: offsetY,
                    scaleX: scale,
                    scaleY: scale,
                    selectable: false, // Background image shouldn't be selectable
                    evented: false // Background image shouldn't receive events
                });
                
                // Add image to canvas and send to back
                canvas.add(img);
                canvas.sendToBack(img);
                backgroundImage = img;
                
                // Show canvas and hide drop hint
                elements.canvas.classList.add('has-image');
                elements.dropHint.classList.add('hidden');
                
                // Show canvas action buttons
                elements.canvasActions.classList.remove('d-none');
                elements.canvasActions.classList.add('d-flex');
                
                // Show text boxes now that image is loaded
                showTextBoxes();
                
                // Set top text as initially selected
                canvas.setActiveObject(topTextBox);
                currentSelectedText = topTextBox;
                updateControlsForSelection();
                
                // Enable download button
                elements.downloadBtn.disabled = false;
                
                // Enable mobile download button too
                const mobileDownloadBtn = document.getElementById('mobile-downloadBtn');
                if (mobileDownloadBtn) {
                    mobileDownloadBtn.disabled = false;
                }
                
                canvas.renderAll();
                saveCanvasState(); // Save state after image load
                console.log('Image loaded successfully! 🎨');
                
            } catch (error) {
                console.error('Error loading image:', error);
            }
        });
    };
    
    reader.onerror = function() {
        console.error('Error reading image file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Center the currently selected text object horizontally
 */
function centerSelectedTextHorizontally() {
    if (!currentSelectedText) {
        console.warn('Please select a text object first');
        return;
    }
    
    const canvasCenter = canvas.width / 2;
    currentSelectedText.set('left', canvasCenter);
    canvas.renderAll();
    
    console.log('Text centered horizontally ↔️');
}

/**
 * Delete the currently selected object (except background image)
 */
function deleteSelectedObject() {
    const activeObject = canvas.getActiveObject();
    
    if (!activeObject) {
        console.warn('Please select an object to delete');
        return;
    }
    
    // Don't allow deletion of background image
    if (activeObject === backgroundImage) {
        console.warn('Cannot delete background image');
        return;
    }
    
    // Don't allow deletion of default text boxes, just clear their content
    if (activeObject === topTextBox) {
        topTextBox.set('text', '');
        elements.topTextInput.value = '';
        syncMobileControl('topTextInput', '');
        canvas.renderAll();
        console.log('Top text cleared');
        return;
    }
    
    if (activeObject === bottomTextBox) {
        bottomTextBox.set('text', '');
        elements.bottomTextInput.value = '';
        syncMobileControl('bottomTextInput', '');
        canvas.renderAll();
        console.log('Bottom text cleared');
        return;
    }
    
    // For any other objects, remove them
    canvas.remove(activeObject);
    currentSelectedText = null;
    canvas.renderAll();
    
    console.log('Object deleted 🗑️');
}

/**
 * Share the meme using the Web Share API
 */
async function shareMeme() {
    if (!backgroundImage) {
        console.warn('Please add an image first');
        return;
    }
    
    try {
        // Check if Web Share API is supported
        if (!navigator.share) {
            console.warn('Web Share API not supported. Falling back to download.');
            downloadMeme();
            return;
        }
        
        // Deselect all objects for clean export
        canvas.discardActiveObject();
        canvas.renderAll();
        
        // Convert canvas to blob
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 1
        });
        
        // Convert data URL to blob
        const response = await fetch(dataURL);
        const blob = await response.blob();
        
        // Create a file from the blob
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        
        // Use Web Share API to share
        await navigator.share({
            title: 'Check out my meme!',
            text: 'I created this meme with Meme Creator',
            files: [file]
        });
        
        console.log('Meme shared successfully! 📤');
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Share was cancelled by user');
        } else {
            console.error('Error sharing meme:', error);
            // Fallback to download if share fails
            console.log('Falling back to download...');
            downloadMeme();
        }
    }
}

/**
 * Download the meme as PNG using FileSaver.js
 */
function downloadMeme() {
    if (!backgroundImage) {
        console.warn('Please add an image first');
        return;
    }
    
    try {
        // Deselect all objects for clean export
        canvas.discardActiveObject();
        canvas.renderAll();
        
        // Convert canvas to data URL then to blob for download
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 1
        });
        
        // Convert data URL to blob
        fetch(dataURL)
            .then(res => res.blob())
            .then(blob => {
                // Use FileSaver.js to download the blob
                saveAs(blob, 'meme.png');
                console.log('Meme downloaded successfully! 💾');
            })
            .catch(error => {
                console.error('Error converting to blob:', error);
            });
        
    } catch (error) {
        console.error('Error downloading meme:', error);
    }
}

/**
 * Add a new text box to the canvas
 */
function addNewTextBox() {
    // Only allow adding text if image is loaded
    if (!backgroundImage) {
        console.warn('Please add an image first');
        return;
    }
    
    const newTextBox = new fabric.Textbox('NEW TEXT', {
        left: canvas.width / 2,
        top: canvas.height / 2,
        width: canvas.width * 0.6,
        fontFamily: 'Impact',
        fontSize: DEFAULT_FONT_SIZE,
        fill: DEFAULT_TEXT_COLOR,
        stroke: DEFAULT_STROKE_COLOR,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: true,
        editable: true,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: true,
        visible: true // Always visible for new text boxes
    });
    
    canvas.add(newTextBox);
    canvas.setActiveObject(newTextBox);
    allTextBoxes.push(newTextBox);
    currentSelectedText = newTextBox;
    
    saveCanvasState();
    console.log('New text box added! Click to edit.');
}

/**
 * Apply image filters (brightness and contrast)
 */
function applyImageFilters() {
    if (!backgroundImage) return;
    
    const brightness = parseInt(elements.brightnessSlider.value);
    const contrast = parseInt(elements.contrastSlider.value);
    
    const filters = [];
    
    if (brightness !== 0) {
        filters.push(new fabric.Image.filters.Brightness({
            brightness: brightness / 100
        }));
    }
    
    if (contrast !== 0) {
        filters.push(new fabric.Image.filters.Contrast({
            contrast: contrast / 100
        }));
    }
    
    backgroundImage.filters = filters;
    backgroundImage.applyFilters();
    canvas.renderAll();
    saveCanvasState();
}

/**
 * Reset all image filters
 */
function resetImageFilters() {
    elements.brightnessSlider.value = 0;
    elements.contrastSlider.value = 0;
    elements.brightnessValue.textContent = '0';
    elements.contrastValue.textContent = '0';
    
    // Sync mobile controls
    syncMobileControl('brightnessSlider', 0);
    syncMobileControl('contrastSlider', 0);
    syncMobileControl('brightnessValue', '0', 'textContent');
    syncMobileControl('contrastValue', '0', 'textContent');
    
    if (backgroundImage) {
        backgroundImage.filters = [];
        backgroundImage.applyFilters();
        canvas.renderAll();
        saveCanvasState();
    }
    
    console.log('Image filters reset');
}

/**
 * Save canvas state for undo/redo functionality
 */
function saveCanvasState() {
    if (historyStep < canvasHistory.length - 1) {
        canvasHistory.length = historyStep + 1;
    }
    
    canvasHistory.push(JSON.stringify(canvas.toJSON()));
    historyStep++;
    
    // Limit history to 20 steps for performance
    if (canvasHistory.length > 20) {
        canvasHistory.shift();
        historyStep--;
    }
    
    updateUndoRedoButtons();
}

/**
 * Undo last action
 */
function undo() {
    if (historyStep > 0) {
        historyStep--;
        loadCanvasState(canvasHistory[historyStep]);
        updateUndoRedoButtons();
        console.log('Undone');
    }
}

/**
 * Redo last undone action
 */
function redo() {
    if (historyStep < canvasHistory.length - 1) {
        historyStep++;
        loadCanvasState(canvasHistory[historyStep]);
        updateUndoRedoButtons();
        console.log('Redone');
    }
}

/**
 * Load canvas state from history
 */
function loadCanvasState(state) {
    canvas.loadFromJSON(state, function() {
        canvas.renderAll();
        // Reestablish references
        backgroundImage = null;
        allTextBoxes = [];
        
        canvas.forEachObject(function(obj) {
            if (obj.type === 'image') {
                backgroundImage = obj;
            } else if (obj.type === 'textbox') {
                allTextBoxes.push(obj);
            }
        });
        
        // Update topTextBox and bottomTextBox references
        if (allTextBoxes.length >= 2) {
            topTextBox = allTextBoxes[0];
            bottomTextBox = allTextBoxes[1];
        }
    });
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
    const undoDisabled = historyStep <= 0;
    const redoDisabled = historyStep >= canvasHistory.length - 1;
    
    elements.undoBtn.disabled = undoDisabled;
    elements.redoBtn.disabled = redoDisabled;
    
    // Update mobile buttons too
    const mobileUndoBtn = document.getElementById('mobile-undoBtn');
    const mobileRedoBtn = document.getElementById('mobile-redoBtn');
    if (mobileUndoBtn) mobileUndoBtn.disabled = undoDisabled;
    if (mobileRedoBtn) mobileRedoBtn.disabled = redoDisabled;
}

/**
 * Clear all text from canvas
 */
function clearAllText() {
    allTextBoxes.forEach(textBox => {
        textBox.set('text', '');
    });
    
    elements.topTextInput.value = '';
    elements.bottomTextInput.value = '';
    
    // Sync mobile controls
    syncMobileControl('topTextInput', '');
    syncMobileControl('bottomTextInput', '');
    
    canvas.renderAll();
    saveCanvasState();
    console.log('All text cleared');
}

// Export functions for potential external use or debugging
window.memeGenerator = {
    canvas,
    loadImageToCanvas,
    downloadMeme
}; 