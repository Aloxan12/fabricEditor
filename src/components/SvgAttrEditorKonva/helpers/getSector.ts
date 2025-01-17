import {SeatData} from "../Dto.ts";

export const getSector = (currentPlace: SeatData, places:  SeatData[]) => {
    return places.filter(place => {
        const sector = currentPlace.sector;
        return place.sector === sector
    })
}