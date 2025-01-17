import {SvgAttrEditorKonva} from "./SvgAttrEditorKonva.tsx";
import {useGetPlaces} from "./hooks/useGetPlaces.ts";
import {SeatData} from "./Dto.ts";
import {useGetImage} from "./hooks/useGetImage.ts";
import {useState} from "react";

export interface PlacesIds{
    [key: number | string]: SeatData
}

export const SvgAttrEditorKonvaWrap = () => {
    const places: SeatData[] = useGetPlaces()
    const { image }  = useGetImage()
    const [selectedPlaces, setSelectedPlaces] = useState<PlacesIds>({})

    const onSeatClickHandler = (value: SeatData )=> setSelectedPlaces(prev => {
        if(prev[value.seatId]){
            const newPlaces = { ...prev };
            delete newPlaces[value.seatId];
            console.log('newPlaces', newPlaces)
            return newPlaces;
        }else{
            return {...prev, [value.seatId]: value}
        }
    })
    console.log('selectedPlaces', selectedPlaces)
    return (
       <SvgAttrEditorKonva selectedPlaces={selectedPlaces} places={places} image={image} onSeatClick={onSeatClickHandler} />
    );
}