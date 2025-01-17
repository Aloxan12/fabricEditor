import React, {FunctionComponent, SVGProps, useCallback, useEffect, useRef, useState} from "react";
import './SvgAttrEditor.css'
import {SvgZoomPanWrapper} from "./SvgZoomPanWrapper.tsx";

interface SvgAttrEditorProps {
    svg: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
}

export const SvgAttrEditor = ({}:SvgAttrEditorProps) => {
    const [selectedGroup, setSelectedGroup] = useState<SVGElement | null>(null);
    const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
    const [attributes, setAttributes] = useState<Record<string, string>>({});
    const [xmlData, setXmlData] = useState<Document | null>(null);
    const svgContainerRef = useRef<SVGSVGElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleElementClick = (event: React.MouseEvent<SVGElement>) => {
        event.stopPropagation();
        const target = event.target as SVGElement & any;
        console.log('target', target)
        if(target.attributes['sbt:seat'] || target.attributes['sbt:cat'] || target.attributes['sbt:row']){
            setSelectedElement(target);

            const attrs: Record<string, string> = {};
            for (let i = 0; i < target.attributes.length; i++) {
                const attr = target.attributes[i];
                attrs[attr.name] = attr.value;
            }
            setAttributes(attrs);
        }
    };

    const handleGroupClick = useCallback((event: Event) => {
        console.log("Группа была нажата", event.currentTarget);
        if(selectedGroup){
            selectedGroup.classList.remove('active')
        }
        const group = event.currentTarget as SVGElement;
        group.classList.add('active');
        setSelectedGroup(group)
    }, [selectedGroup])

    useEffect(() => {
        const svgElement = svgContainerRef.current;
        if (svgElement) {
            const groups = svgElement.querySelectorAll("g");
            console.log('groups', groups[10]?.attributes)
            groups.forEach((group) => {
                // @ts-ignore
                if(group.attributes['sbt:row'] || group?.attributes['sbt:sect']){
                    group.addEventListener("click", handleGroupClick);
                }
            });
        }

        return () => {
            if (svgElement) {
                const groups = svgElement.querySelectorAll("g");
                groups.forEach((group) => {
                    // @ts-ignore
                    if(group.attributes['sbt:row'] || group?.attributes['sbt:sect']){
                        group.removeEventListener("click", handleGroupClick);
                    }
                });
            }
        };
    }, [xmlData, handleGroupClick]);

    useEffect(() => {
        const fetchXml = async () => {
            // Путь будет работать, если файл находится в public
            const response = await fetch('/Лужники.svg');
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'image/svg+xml');
            setXmlData(xml);
        };
        fetchXml().catch(err => console.log(err));
    }, []);

    // Обновление атрибутов
    const handleAttributeChange = (name: string, value: string) => {
        if (selectedElement) {
            selectedElement.setAttribute(name, value);
            setAttributes({ ...attributes, [name]: value });
        }
    };

    useEffect(() => {
        if (canvasRef.current && xmlData) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Преобразование XML (SVG) в изображение
                const svgString = new XMLSerializer().serializeToString(xmlData.documentElement);

                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    URL.revokeObjectURL(url); // Освобождение памяти
                };
                img.src = url;
            }
        }
    }, [xmlData])

    return (
        <div style={{ width: '100%', display: "flex", gap: "20px" }}>
            <SvgZoomPanWrapper
                width={500}
                height={500}
                svgWidth={500}
                svgHeight={500}
                // viewBox="0 0 500 500"
            >
                <foreignObject ref={svgContainerRef} x="0" y="0" width="500" height="500" onClick={handleElementClick}>
                    {xmlData &&
                        <div
                            className="svg-main"
                            dangerouslySetInnerHTML={{__html: new XMLSerializer().serializeToString(xmlData)}}
                        />}
                </foreignObject>
            </SvgZoomPanWrapper>
            {selectedElement && (
                <div style={{ border: "1px solid #ccc", padding: "10px" }}>
                    <h3>Изменить атрибуты</h3>
                    {Object.entries(attributes).map(([name, value]) => (
                        <div key={name}>
                            <label>
                                {name.replace('sbt:seat', 'место')}:{" "}
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleAttributeChange(name, e.target.value)}
                                />
                            </label>
                        </div>
                    ))}
                </div>
            )}
            </div>
    );
};