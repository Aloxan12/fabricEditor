import {SeatData} from "./Dto.ts";

// Определение границ области
interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Представление точки
interface Point {
    x: number;
    y: number;
    data: SeatData;
}

export class QuadTree {
    private bounds: Bounds;
    private maxPoints: number;
    private points: Point[] = [];
    private divided: boolean = false;
    private northWest?: QuadTree;
    private northEast?: QuadTree;
    private southWest?: QuadTree;
    private southEast?: QuadTree;

    constructor(bounds: Bounds, maxPoints: number = 4) {
        this.bounds = bounds;
        this.maxPoints = maxPoints;
    }

    // Проверяет, содержит ли область точку
    contains(point: { x: number; y: number }): boolean {
        return (
            point.x >= this.bounds.x &&
            point.x < this.bounds.x + this.bounds.width &&
            point.y >= this.bounds.y &&
            point.y < this.bounds.y + this.bounds.height
        );
    }

    // Разделяет узел на четыре квадранта
    subdivide(): void {
        const x = this.bounds.x;
        const y = this.bounds.y;
        const halfWidth = this.bounds.width / 2;
        const halfHeight = this.bounds.height / 2;

        const nw = { x, y, width: halfWidth, height: halfHeight };
        const ne = { x: x + halfWidth, y, width: halfWidth, height: halfHeight };
        const sw = { x, y: y + halfHeight, width: halfWidth, height: halfHeight };
        const se = {
            x: x + halfWidth,
            y: y + halfHeight,
            width: halfWidth,
            height: halfHeight,
        };

        this.northWest = new QuadTree(nw, this.maxPoints);
        this.northEast = new QuadTree(ne, this.maxPoints);
        this.southWest = new QuadTree(sw, this.maxPoints);
        this.southEast = new QuadTree(se, this.maxPoints);

        this.divided = true;

        // Перемещаем существующие точки в подквадранты
        for (const point of this.points) {
            this.insertIntoQuadrants(point);
        }
        this.points = [];
    }

    // Вставляет точку в подквадранты
    private insertIntoQuadrants(point: Point): void {
        if (this.northWest!.insert(point)) return;
        if (this.northEast!.insert(point)) return;
        if (this.southWest!.insert(point)) return;
        if (this.southEast!.insert(point)) return;
    }

    // Вставляет точку в дерево
    insert(point: Point) {
        if (!this.contains(point)) {
            return false;
        }

        if (this.points.length < this.maxPoints && !this.divided) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        return this.insertIntoQuadrants(point);
    }

    // Ищет ближайшую точку к заданным координатам
    findNearest(x: number, y: number, maxDistance: number): SeatData | null {
        let nearestPoint: SeatData | null = null;
        let nearestDistance = maxDistance;

        // Функция для проверки расстояния до точки
        const checkPoint = (point: Point) => {
            const dx = point.x - x;
            const dy = point.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPoint = point.data;
            }
        };

        // Проверяем текущий узел
        for (const point of this.points) {
            checkPoint(point);
        }

        // Если узел разделен, проверяем дочерние узлы
        if (this.divided) {
            // Рассчитываем расстояние до каждого квадранта
            const checkQuadrant = (quadrant: QuadTree) => {
                // Если нашли точку ближе, чем расстояние до квадранта, пропускаем квадрант
                const quadrantResult = quadrant.findNearest(x, y, nearestDistance);
                if (quadrantResult) {
                    const dx = quadrantResult.coodrinates.x - x;
                    const dy = quadrantResult.coodrinates.y - y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestPoint = quadrantResult;
                    }
                }
            };

            checkQuadrant(this.northWest!);
            checkQuadrant(this.northEast!);
            checkQuadrant(this.southWest!);
            checkQuadrant(this.southEast!);
        }

        return nearestPoint;
    }

    // Создает QuadTree из массива мест
    static buildFromPlaces(places: SeatData[]): QuadTree {
        // Находим минимальные и максимальные координаты
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const place of places) {
            minX = Math.min(minX, place.coodrinates.x);
            minY = Math.min(minY, place.coodrinates.y);
            maxX = Math.max(maxX, place.coodrinates.x);
            maxY = Math.max(maxY, place.coodrinates.y);
        }

        // Добавляем небольшой отступ
        minX -= 10;
        minY -= 10;
        maxX += 10;
        maxY += 10;

        const width = maxX - minX;
        const height = maxY - minY;

        // Создаем QuadTree
        const quadTree = new QuadTree({
            x: minX,
            y: minY,
            width,
            height,
        }, 8); // Максимум 8 точек в узле

        // Добавляем все места
        for (const place of places) {
            quadTree.insert({
                x: place.coodrinates.x,
                y: place.coodrinates.y,
                data: place,
            });
        }

        return quadTree;
    }
}