import React, {FunctionComponent, SVGProps, useEffect, useRef, useState} from "react";
import './SvgAttrEditor.css'

interface SvgAttrEditorProps {
    svg: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
}

export const SvgAttrEditor = ({}:SvgAttrEditorProps) => {
    const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
    const [attributes, setAttributes] = useState<Record<string, string>>({});
    const [xmlData, setXmlData] = useState<Document | null>(null);
    const svgContainerRef = useRef<SVGSVGElement | null>(null);

    const handleElementClick = (event: React.MouseEvent<SVGElement>) => {
        event.stopPropagation();
        const target = event.target as SVGElement & any;

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

    useEffect(() => {
        const svgElement = svgContainerRef.current;
        const handleGroupClick = (event: Event) => {
            console.log("Группа была нажата", event.currentTarget);
        };
        if (svgElement) {
            const groups = svgElement.querySelectorAll("g");
            console.log('groups', groups[99]?.attributes)
            groups.forEach((group) => {
                // @ts-ignore
                if(group.attributes['sbt:row'] || group?.attributes['sbt:sect']){
                    group.addEventListener("click", handleGroupClick);
                }
            });
        }

        // Очистка после рендеринга компонента
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
    }, [xmlData]);

    useEffect(() => {
        const fetchXml = async () => {
            // Путь будет работать, если файл находится в public
            const response = await fetch('/exemple.svg');
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'application/xml');
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

    return (
        <div style={{ width: '100%', display: "flex", gap: "20px" }}>
            <svg  ref={svgContainerRef} width="100%" height="100%" viewBox="0 0 500 500">
                <foreignObject x="0" y="0" width="500" height="500" onClick={handleElementClick}>
                    {xmlData &&
                        <div
                            className="svg-main"
                            dangerouslySetInnerHTML={{__html: new XMLSerializer().serializeToString(xmlData)}}
                        />}
                </foreignObject>
            </svg>
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