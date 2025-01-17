interface IImg {
    "url": string
    "mimeType": string
    "filename": string
}

interface ICategory {
    "id": string,
    "placement": boolean,
    "name": string,
    "seatsNumber": string,
    "initPrice": number
}

export interface SeatData{
    "coodrinates": {
        "x": number
        "y": number
    },
    "seatId": string,
    "sector": string,
    "row": string,
    "number": string,
    "categoryId": string
}

interface CheckPlanData{
    categories: []
    notRecognizedSeats: []
    optimizedSvgData: string
    responseTextData: string
    seatDataList: SeatData[]
}

export interface AllData{
    checkPlanData: CheckPlanData,
    png: IImg
    simpleSeatingPlan: {
        "categoryList": ICategory[],
        "categoryLimitList": [],
        "id": "864",
        "venueId": "11",
        "venueName": "Тестовая площадка",
        "currency": "RUB",
        "placement": true,
        "name": "айсберг для вбс 530",
        "splExists": false,
        "owner": true
    },
    svg: IImg
}
