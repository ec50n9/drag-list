/**
 * 拖拽
 * 
 * @param {HTMLElement|string} container 拖拽root元素
 * @param {string} itemSelector 拖拽元素选择器
 * @param {()=>void} onDragStart 拖拽开始回调
 * @param {()=>void} onDragEnd 拖拽结束回调
 */
function enableDrag(container, itemSelector, onDragStart, onDragEnd) {
    if (typeof container === 'string')
        container = document.querySelector(container);
    if (container === null)
        throw new Error('container is null');

    let draggableItems = container.querySelectorAll(itemSelector);
    if (draggableItems === null)
        throw new Error('draggableItems is null');

    // 初始化元素
    container.style.position = 'relative';

    /**
     * 可拖拽元素的初始位置和大小
     * @type {{x: number, y: number, width: number, height: number, index: number}[]}
     */
    const initRectList = [];
    const elementIndexMap = new WeakMap();

    function initElementsData() {
        initRectList.length = 0;
        draggableItems = container.querySelectorAll(itemSelector);
        Array.from(draggableItems).forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            initRectList.push({
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                index
            });
            elementIndexMap.set(item, index);
        });
    }
    initElementsData();

    /**
     * @type {HTMLElement?}
     */
    let draggingElement = null;

    /**
     * @type {HTMLElement?}
     */
    let draggingElementClone = null;

    const startPosition = { x: 0, y: 0 };

    let startIndex = -1;
    let endIndex = -1;

    let preEneIndex = -1;

    /**
     * 按下事件
     * @param {PointerEvent} event
     */
    function onPointerDown(event) {
        const target = event.target;
        if (!elementIndexMap.has(target))
            return;

        startPosition.x = event.clientX;
        startPosition.y = event.clientY;

        container.classList.add('drag-list--dragging')

        draggingElement = target;
        draggingElement.classList.add('drag-item--dragging');

        draggingElementClone = draggingElement.cloneNode(true);
        draggingElementClone.classList.add('drag-item--clone');
        container.appendChild(draggingElementClone);

        const rect = draggingElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        draggingElementClone.style.position = 'absolute';
        draggingElementClone.style.left = x + 'px';
        draggingElementClone.style.top = y + 'px';
        draggingElementClone.style.width = rect.width + 'px';
        draggingElementClone.style.height = rect.height + 'px';

        startIndex = elementIndexMap.get(target);
    }

    /**
     * 移动事件
     * @param {PointerEvent} event
     */
    function onPointerMove(event) {
        const target = event.target;
        // 设置克隆元素的位置
        const x = event.clientX - startPosition.x;
        const y = event.clientY - startPosition.y;
        draggingElementClone.style.transform = `translate(${x}px, ${y}px)`;

        // 获取当前鼠标在哪个元素上
        initRectList.some((rect, index) => {
            const x = event.clientX;
            const y = event.clientY;
            if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
                // 如果鼠标在当前元素上
                endIndex = index;
                return true;
            }
            return false;
        });
        updateItems();
    }

    function move(fromIndex, toIndex) {
        const x = initRectList[toIndex].x - initRectList[fromIndex].x;
        const y = initRectList[toIndex].y - initRectList[fromIndex].y;
        draggableItems[fromIndex].style.transform = `translate(${x}px, ${y}px)`;
    }

    function updateItems() {
        if (preEneIndex === endIndex)
            return;
        if (startIndex === -1 || endIndex === -1)
            return;

        Array.prototype.forEach.call(draggableItems, (item, index) => {
            if (index === startIndex) {
                move(index, endIndex)
            } else if (index > startIndex && index <= endIndex) {
                move(index, index - 1);
            } else if (index >= endIndex && index < startIndex) {
                move(index, index + 1);
            } else {
                item.style.transform = `translate(0px, 0px)`;
            }
        });

        preEneIndex = endIndex;
    }

    /**
     * 抬起事件
     * @param {PointerEvent} event
     */
    function onPointerUp(event) {
        // 移除事件和样式和克隆元素
        container.classList.remove('drag-list--dragging')
        draggingElement.classList.remove('drag-item--dragging');
        draggingElementClone.remove();
        draggingElementClone = null;

        if (startIndex !== endIndex) {
            // 将元素移动到endIndex的位置
            const startItem = draggableItems[startIndex];
            const endItem = draggableItems[endIndex];
            if (startIndex < endIndex)
                container.insertBefore(startItem, endItem.nextSibling);
            else
                container.insertBefore(startItem, endItem);

            draggableItems.forEach(item => 
                item.style.transform = `translate(0px, 0px)`
            );
            initElementsData();
        }

        // 重置
        startIndex = -1;
        endIndex = -1;
    }

    container.addEventListener('pointerdown', (event) => {
        onPointerDown(event);
        container.addEventListener('pointermove', onPointerMove);
    });
    container.addEventListener('pointerup', (event) => {
        onPointerUp(event)
        container.removeEventListener('pointermove', onPointerMove);
    });
}