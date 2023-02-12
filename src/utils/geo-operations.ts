import { polygon, area, transformScale, centerOfMass, transformRotate } from '@turf/turf'

// calculate land area of the whole land from the coordinates in the geojson file
// use above value to calculate building metrics based on lot coverage and floor height
export const computeGeoMatrics = (coordinates: any, floorHeight: number, floorNumber: number, lotCoverage: number) => {
    const areaPolygon = polygon(coordinates)
        const landArea = parseFloat(area(areaPolygon).toFixed(2))
        const buildingHeight = floorHeight*floorNumber
        const buildingArea = parseFloat((landArea*lotCoverage).toFixed(2))
        const volume = parseFloat((buildingArea*buildingHeight).toFixed(2))
        // calculate center of polygon which will be used for scaling and rotating the building layer
        const center = centerOfMass(areaPolygon)

        return { center, landArea, buildingArea, volume, buildingHeight }
}

// calculate building coordinates by scaling the land geojson coordinates using the initial lot coverage
//  apply a correction rotation of 180 deg
export const geoTransform = (data: any, lotCoverage: number, origin: number[]) => {
    return transformRotate(transformScale(data, -lotCoverage/100, 
                                          { origin }),
                                          180, 
                                          { pivot: origin })
}