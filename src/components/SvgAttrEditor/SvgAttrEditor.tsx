import React, {FunctionComponent, SVGProps, useEffect, useState} from "react";
import './SvgAttrEditor.css'

interface SvgAttrEditorProps {
    svg: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
}

export const SvgAttrEditor = ({}:SvgAttrEditorProps) => {
    const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
    const [attributes, setAttributes] = useState<Record<string, string>>({});
    const [xmlData, setXmlData] = useState<Document | null>(null);
    console.log('xmlData', xmlData)

    const handleElementClick = (event: React.MouseEvent<SVGElement>) => {
        event.stopPropagation();
        const target = event.target as SVGElement & any;

        console.log('target', target)
        const parentElement = target.parentNode
        if(parentElement){
            console.log('parentElement', parentElement)
            const deepParentElement = parentElement.parentElement;
            console.log('deepParentElement', deepParentElement)
            // console.log(
            //     "Parent Attributes:",
            //     Array.from(parentElement.attributes).map((attr: any) => ({
            //         name: attr.name,
            //         value: attr.value,
            //     }))
            // );
        }
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
        const fetchXml = async () => {
            // Путь будет работать, если файл находится в public
            const response = await fetch('/exemple.svg');
            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'application/xml');
            setXmlData(xml);
        };
        fetchXml();
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
            <svg width="100%" height="100%" viewBox="0 0 500 500">
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