class Draggable {
    containerElement = null;
    /**
     * 所有拖拽元素的矩形区域
     * @type {Array}
     * @property {number} x - 矩形区域的左上角x坐标
     * @property {number} y - 矩形区域的左上角y坐标
     * @property {number} width - 矩形区域的宽度
     * @property {number} height - 矩形区域的高度
     * @property {number} index - 矩形区域对应的拖拽元素的索引
     */
    rectList = [];
    drag = { element: null, index: 0 };
    clone = { element: null, x: 0, y: 0 };
    preCurrentIndex = -1;

    constructor(options) {
        this.containerElement = options.containerElement;
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.initRectList();
        console.log(this.rectList);
    }

    // 初始化所有拖拽元素的矩形区域
    initRectList() {
        this.rectList.length = 0;
        const containerRect = this.containerElement.getBoundingClientRect();
        const dragItems = this.containerElement.querySelectorAll('.drag-item');
        dragItems.forEach((dragItem, index) => {
            const rect = dragItem.getBoundingClientRect();
            this.rectList.push({
                x: rect.left - containerRect.left,
                y: rect.top - containerRect.top,
                width: rect.width,
                height: rect.height,
                index,
                text: dragItem.innerText
            });
        });
    }

    onPointerDown(event) {
        // 创建一个拖拽元素的克隆
        this.drag.element = event.target;
        // 这里应该设置元素的下标
        this.drag.index = Array.from(this.containerElement.children).indexOf(this.drag.element);
        this.drag.element.classList.add('drag-item--dragging');

        // 创建克隆元素
        this.clone.element = this.drag.element.cloneNode(true);
        this.clone.element.classList.add('drag-item--clone');
        this.containerElement.appendChild(this.clone.element);

        // 将拖拽元素的大小位置设置给克隆元素
        const rect = this.drag.element.getBoundingClientRect();
        const containerRect = this.containerElement.getBoundingClientRect();
        this.clone.element.style.width = rect.width + 'px';
        this.clone.element.style.height = rect.height + 'px';
        this.clone.element.style.left = rect.left - containerRect.left + 'px';
        this.clone.element.style.top = rect.top - containerRect.top + 'px';
    }

    onPointerMove(event) {
        // 设置克隆元素的位置
        if (!this.clone.element) return;
        const containerRect = this.containerElement.getBoundingClientRect();
        this.clone.x = event.clientX - containerRect.left - this.clone.element.offsetWidth / 2;
        this.clone.y = event.clientY - containerRect.top - this.clone.element.offsetHeight / 2;
        this.clone.element.style.left = this.clone.x + 'px';
        this.clone.element.style.top = this.clone.y + 'px';

        // 获取拖拽元素的中心点所在的矩形区域
        const currentIndex = this.rectList.findIndex(rect => {
            return this.clone.x + this.clone.element.offsetWidth / 2 > rect.x
                && this.clone.x + this.clone.element.offsetWidth / 2 < rect.x + rect.width
                && this.clone.y + this.clone.element.offsetHeight / 2 > rect.y
                && this.clone.y + this.clone.element.offsetHeight / 2 < rect.y + rect.height;
        });

        if (currentIndex !== -1 && currentIndex !== this.drag.index && currentIndex !== this.preCurrentIndex) {
            this.moveDragingTo(currentIndex)
            this.preCurrentIndex = currentIndex;
        }
    }

    move(element, fromIndex, toIndex) {
        const x = this.rectList[toIndex].x - this.rectList[fromIndex].x;
        const y = this.rectList[toIndex].y - this.rectList[fromIndex].y;
        element.style.transform = `translate(${x}px, ${y}px)`;
    }

    moveDragingTo(index){
        this.move(this.containerElement.children[this.drag.index], this.drag.index, index);

        if (index > this.drag.index) {
            // 遍历移动元素，i是目标位置的索引
            for (let i = this.drag.index; i < index; i++) {
                this.move(this.containerElement.children[i + 1], i + 1, i)
            }
        } else if (index < this.drag.index) {
            for (let i = this.drag.index; i > index; i--) {
                this.move(this.containerElement.children[i - 1], i - 1, i)
            }
        }

        // 更新rectList
        // console.log('before', this.rectList.map(item => item.text));
        // const temp = JSON.parse(JSON.stringify(this.rectList[this.drag.index]));
        // this.rectList.splice(this.drag.index, 1);
        // this.rectList.splice(index, 0, temp);
        // this.rectList.forEach((item, index) => item.index = index);
        // console.log('after', this.rectList.map(item => item.text));
    }

    onPointerUp(event) {
        // 清理
        this.drag.element.classList.remove('drag-item--dragging');
        this.clone.element.remove();
        this.clone.element = null;
    }

    bindEventListeners() {
        this.containerElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.containerElement.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.containerElement.addEventListener('pointerup', this.onPointerUp.bind(this));
    }
}

const container = document.querySelector('.drag-list')
new Draggable({
    containerElement: container
});