import React from 'react'
import { connect } from 'react-redux'
import { ContextMenuTarget, Menu, MenuItem, MenuDivider } from '@blueprintjs/core'
import Checkmark from '../components/Checkmark'
import { labelImages, unlabelImages } from '../actions'
import { getImageProbGetter, getPosLabelImageSet, getNegLabelImageSet } from '../selectors'

const regImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  transition: 'transform .135s cubic-bezier(0.0,0.0,0.2,1),opacity linear .15s',
}
const backImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  transform: 'translateZ(0px) scale3d(0.85, 0.85, 1)',
  transition: 'transform .135s cubic-bezier(0.0,0.0,0.2,1),opacity linear .15s',
}
const imgDivStyle = {
  margin: 1.5,
  backgroundColor: '#48AFF0',
  cursor: 'pointer',
}

class ImageComponent extends React.PureComponent {
  render() {
    const { pos, neg, imageUrl } = this.props
    const labeled = pos | neg
    const imgStyle = Object.assign({}, labeled ? backImgStyle : regImgStyle)
    return (
      <div style={imgDivStyle} className="img-div">
        <Checkmark pos={pos} neg={neg} />
        <img style={imgStyle} alt={''} src={imageUrl} />
        <style>{`.img-div:hover{outline:3px solid #06befa}`}</style>
      </div>
    )
  }
  renderContextMenu() {
    const { imageId, prob, pos, neg, labelPos, labelNeg, unlabel } = this.props
    const menuItems = []
    if (pos) {
      menuItems.push(<MenuItem onClick={unlabel} text="Remove label" />)
      menuItems.push(<MenuItem onClick={labelNeg} text="Relabel Negative" />)
    } else if (neg) {
      menuItems.push(<MenuItem onClick={unlabel} text="Remove label" />)
      menuItems.push(<MenuItem onClick={labelPos} text="Relabel Positive" />)
    } else {
      menuItems.push(<MenuItem onClick={labelPos} text="Label Positive" />)
      menuItems.push(<MenuItem onClick={labelNeg} text="Label Negative" />)
    }
    menuItems.push(<MenuDivider />)
    menuItems.push(<MenuItem disabled={true} text={`ImageId: ${imageId}`} />)
    menuItems.push(<MenuItem disabled={true} text={`Probability: ${prob}`} />)
    return <Menu> {menuItems} </Menu>
  }
}

const mapStateToProps = (state, ownProps) => {
  const img = ownProps.imageId
  const getProb = getImageProbGetter(state)
  const posImages = getPosLabelImageSet(state)
  const negImages = getNegLabelImageSet(state)
  return {
    pos: posImages.contains(img),
    neg: negImages.contains(img),
    prob: getProb(img),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  labelPos: () => dispatch(labelImages([ownProps.imageId], [])),
  labelNeg: () => dispatch(labelImages([], [ownProps.imageId])),
  unlabel: () => dispatch(unlabelImages([ownProps.imageId])),
})

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenuTarget(ImageComponent))
