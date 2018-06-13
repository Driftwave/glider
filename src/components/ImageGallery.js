import React from 'react'
import { Grid, AutoSizer } from 'react-virtualized'
import { Spinner } from '@blueprintjs/core'
import ImageContainer from '../containers/ImageContainer'
import '../ball-clip-rotate.css'

const generateImageRenderer = ({ isFetching, imageSize, imageIds, columnCount, columnWidth }) => ({
    style,
    columnIndex,
    rowIndex,
}) => {
    const index = rowIndex * columnCount + columnIndex

    if (index >= imageIds.length) return <div />

    const imageId = imageIds[index]
    const imageUrl = `/photos/${imageSize}x${imageSize}/${imageId}.jpg`

    //calculate x,y scale
    // const sx = (100 - 30 / columnWidth * 100) / 100;
    // const sy = (100 - 30 / columnWidth * 100) / 100;
    // selectedImgStyle.transform = `translateZ(0px) scale3d(${sx}, ${sy}, 1)`;

    // can't get any spinner animations to work here!!!
    // if (isFetching) {
    //     const innerStyle = {
    //     width: '100%',
    //     height: '100%',
    //     objectFit: 'contain',
    //     display: 'block',
    //     border: 'solid black 1px',
    // }
    // return <div key={imageId} style={style} className="la-ball-clip-rotate" />

    return (
        <div key={imageId} style={style}>
            <ImageContainer
                imageId={imageId}
                imageUrl={imageUrl}
                index={index}
                imageIds={imageIds}
            />
        </div>
    )
}

const ImageGalleryComponent = ({ imageSize, imageIds, isFetching }) => {
    imageIds
    return (
        <AutoSizer>
            {({ height, width }) => {
                const scrollBarWidth = 10
                width = width - scrollBarWidth
                const idealItemWidth = imageSize
                const itemCount = imageIds.length
                const columnCount = Math.max(1, Math.floor(width / idealItemWidth))
                const rowCount = Math.ceil(itemCount / columnCount)
                // We can now recalculate the columnCount knowing how many rows we must
                // display. In the typical case, this is going to be equivalent to
                // `columnCountEstimate`, but if in the case of 5 items and 4 columns, we
                // can fill out to display a a 3x2 with 1 hole instead of a 4x2 with 3
                // holes.
                /* const columnCount = Math.max(
                    1,
                    itemCount && Math.ceil(itemCount / rowCount)
                ); */

                const columnWidth = width / columnCount
                const rowHeight = columnWidth
                const cellRenderer = generateImageRenderer({
                    isFetching,
                    imageSize,
                    imageIds,
                    columnCount,
                    columnWidth,
                })
                console.log('rendering Grid')
                return (
                    <Grid
                        scrollToRow={0}
                        cellRenderer={cellRenderer}
                        columnWidth={columnWidth}
                        columnCount={columnCount}
                        rowCount={rowCount}
                        rowHeight={rowHeight}
                        width={width + scrollBarWidth}
                        height={height}
                    />
                )
            }}
        </AutoSizer>
    )
}

export default ImageGalleryComponent
