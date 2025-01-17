import {useEffect, useMemo, useState} from "react";
import {AllData, SeatData} from "../Dto.ts";

export const useGetPlaces = () => {
    const [places, setPlaces] = useState<SeatData[]>([]); // Места

    useEffect(() => {
        const fetchPlaces = async () => {
            const response = await fetch('/data.json');
            const dataRp: AllData = await response.json();

            console.log('dataRp', dataRp)
            setPlaces(dataRp.checkPlanData.seatDataList);
        };
        fetchPlaces().catch(err => console.log(err));
    }, []);

    return useMemo(() => places, [places]);
}