import {PlacesIds} from "../SvgAttrEditorKonvaWrap.tsx";
import {SeatData} from "../Dto.ts";

export const updatePlaces = (currentPlaces: PlacesIds, newPlaces: SeatData[]) => {
    const ids = newPlaces.map(item => item.seatId);

    const allExist = ids.every(seatId => seatId in currentPlaces);

    if (allExist) {
        const updatedItems = { ...currentPlaces };
        ids.forEach(seatId => {
            delete updatedItems[seatId];
        });
        return updatedItems;
    } else {
        const updatedItems = { ...currentPlaces };
        newPlaces.forEach(item => {
            updatedItems[item.seatId] = item;
        });
        return updatedItems;
    }
}