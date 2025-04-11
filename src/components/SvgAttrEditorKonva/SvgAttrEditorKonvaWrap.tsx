import {SvgAttrEditorKonva} from "./SvgAttrEditorKonva.tsx";
import {useGetPlaces} from "./hooks/useGetPlaces.ts";
import {SeatData} from "./Dto.ts";
import {useGetImage} from "./hooks/useGetImage.ts";
import {useCallback, useState} from "react";
import './SvgAttrEditorKonvaWrap.css'
import {getRow} from "./helpers/getRow.ts";
import {updatePlaces} from "./helpers/updatePlaces.ts";
import {getSector} from "./helpers/getSector.ts";
import {FixedSizeList as List} from 'react-window';

type Tab = 'seat' | 'row' | 'sect'

export interface PlacesIds {
    [key: number | string]: SeatData
}

export const SvgAttrEditorKonvaWrap = () => {
    const places: SeatData[] = useGetPlaces()
    const { image }  = useGetImage()
    const [selectedPlaces, setSelectedPlaces] = useState<PlacesIds>({})
    const [hoveredPlaces, setHoveredPlaces] = useState<PlacesIds>({});
    const [activeTab, setActiveTab] = useState<Tab>('seat')

    const changeActiveTab = (value:Tab )=>()=> setActiveTab(value)

    const onSeatClickHandler = useCallback(
        (value: SeatData) =>{
            switch (activeTab) {
                case 'seat': {
                    return setSelectedPlaces(prev => {
                        if (prev[value.seatId]) {
                            const newPlaces = { ...prev };
                            delete newPlaces[value.seatId];
                            console.log('newPlaces', newPlaces);
                            return newPlaces;
                        } else {
                            return { ...prev, [value.seatId]: value };
                        }
                    })
                }
                case 'row': {
                    const currentRow: SeatData[] = getRow(value, places);
                    return setSelectedPlaces(prev => updatePlaces(prev, currentRow));
                }
                case 'sect': {
                    const currentRow: SeatData[] = getSector(value, places);
                    return setSelectedPlaces(prev => updatePlaces(prev, currentRow));
                }
                default: {
                    return setSelectedPlaces(prev => prev);
                }
            }
        },
        [activeTab, places]
    );

    const onSeatHoverHandler = useCallback(
        (value: SeatData) => {
            switch (activeTab) {
                case 'seat': {
                    return setHoveredPlaces({ [value.seatId]: value });
                }
                case 'row': {
                    const currentRow = getRow(value, places);
                    return setHoveredPlaces(updatePlaces({}, currentRow));
                }
                case 'sect': {
                    const currentSect = getSector(value, places);
                    return setHoveredPlaces(updatePlaces({}, currentSect));
                }
                default:
                    return setHoveredPlaces({});
            }
        },
        [activeTab, places]
    );

    const onSeatLeaveHandler = useCallback(() => {
        setHoveredPlaces({});
    }, []);


    return (
       <div className='svgAttrEditor'>
           <div className='tabs'>
               <button className={activeTab === 'seat' ? 'activeTab' : ''} onClick={changeActiveTab('seat')}>seat</button>
               <button className={activeTab === 'row' ? 'activeTab' : ''} onClick={changeActiveTab('row')}>row</button>
               <button className={activeTab === 'sect' ? 'activeTab' : ''} onClick={changeActiveTab('sect')}>sector</button>
           </div>
           <div className='content'>
               <SvgAttrEditorKonva
                   selectedPlaces={selectedPlaces}
                   hoveredPlaces={hoveredPlaces}
                   onSeatHover={onSeatHoverHandler}
                   places={places}
                   image={image}
                   onSeatClick={onSeatClickHandler}
                   onSeatLeave={onSeatLeaveHandler}
               />
               <div className='choose-attr'>
                   <div>Выбранны:</div>
                   <List height={500}
                         width={300}
                         itemCount={Object.keys(selectedPlaces).length}
                         itemSize={35}
                   >
                       {({ index, style }) => {
                           const seat = Object.values(selectedPlaces)[index];
                           return (
                               <div style={style} className="seat" key={seat.seatId}>
                                   {seat.seatId}
                               </div>
                           );
                       }}
                   </List>
               </div>
           </div>
       </div>
    );
}