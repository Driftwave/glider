import React from 'react'
import { connect } from 'react-redux'
import { Colors, ContextMenuTarget, Menu, MenuItem, MenuDivider } from '@blueprintjs/core'
import { OrderedSet } from 'immutable'
import Checkmark from '../components/Checkmark'

import {
  labelImages,
  labelSelectedPos,
  labelSelectedNeg,
  labelSelectedUnk,
  unlabelSelected,
  toggleSelected,
  unlabelImages,
  labelPosFlipSelected,
  labelNegFlipSelected,
} from '../actions'

import {
  getImageProbGetter,
  getPosLabelSet,
  getNegLabelSet,
  getUnkLabelSet,
  getSelectedImageSet,
} from '../selectors'

const selectColor = Colors.ORANGE3
const posCheckColor = Colors.BLUE3
const negCheckColor = Colors.RED3

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
}
const shrinkStyle = {
  transform: 'translateZ(0px) scale3d(0.93, 0.93, 1)',
  transition: 'transform .135s cubic-bezier(0.0,0.0,0.2,1),opacity linear .15s',
}
const imageDivStyle = {
  margin: 1.7,
  cursor: 'pointer',
  background: selectColor,
}
// const hoverColor = '#FFE39F'
// <style>{`.img-div:hover{outline:2px solid ${hoverColor}}`}</style>

class ImageComponent extends React.PureComponent {
  handleClick = e => {
    const { toggleSelected, shiftToggleSelected } = this.props
    if (e.shiftKey) shiftToggleSelected()
    else toggleSelected()
  }

  // {isPos | isNeg ? <Checkmark color={isPos ? posCheckColor : negCheckColor} /> : null}
  render() {
    const { isPos, isNeg, isSelected, imageUrl } = this.props
    const imgStyle = Object.assign({}, imageStyle, isSelected ? shrinkStyle : null)
    const divStyle = Object.assign({}, imageDivStyle)
    if (isSelected) {
      divStyle.outlineStyle = 'solid'
      divStyle.outlineColor = selectColor
      divStyle.outlineWidth = 2
    }
    return (
      <div style={divStyle} className="img-div" onClick={this.handleClick}>
        <img style={imgStyle} alt={''} src={imageUrl} />
      </div>
    )
  }
  renderContextMenu() {
    const {
      imageId,
      prob,
      isPos,
      isNeg,
      isUnk,
      isSelected,
      someSelected,
      labelPos,
      labelNeg,
      labelUnk,
      labelSelectedPos,
      labelSelectedNeg,
      labelSelectedUnk,
      unlabelSelected,
      unlabel,
      labelPosToHere,
      labelNegToHere,
    } = this.props
    const menuItems = []
    if (isPos) {
      menuItems.push(<MenuItem onClick={unlabel} text="Unmark" />)
      menuItems.push(<MenuItem onClick={labelNeg} text="Re-mark Negative" />)
      menuItems.push(<MenuItem onClick={labelUnk} text="Re-mark Uncertain" />)
    } else if (isNeg) {
      menuItems.push(<MenuItem onClick={unlabel} text="Unmark" />)
      menuItems.push(<MenuItem onClick={labelPos} text="Mark Positive" />)
      menuItems.push(<MenuItem onClick={labelUnk} text="Mark Uncertain" />)
    } else if (isUnk) {
      menuItems.push(<MenuItem onClick={unlabel} text="Unmark" />)
      menuItems.push(<MenuItem onClick={labelPos} text="Mark Positive" />)
      menuItems.push(<MenuItem onClick={labelNeg} text="Mark Negative" />)
    } else {
      menuItems.push(<MenuItem onClick={labelPos} text="Mark Positive" />)
      menuItems.push(<MenuItem onClick={labelNeg} text="Mark Negative" />)
      menuItems.push(<MenuItem onClick={labelUnk} text="Mark Uncertain" />)
    }
    menuItems.push(<MenuDivider />)
    if (someSelected) {
      menuItems.push(<MenuItem onClick={labelSelectedPos} text="Mark Selected Positive" />)
      menuItems.push(<MenuItem onClick={labelSelectedNeg} text="Mark Selected Negative" />)
      menuItems.push(<MenuItem onClick={labelSelectedUnk} text="Mark Selected Uncertain" />)
      menuItems.push(<MenuItem onClick={unlabelSelected} text="Unmark Selected" />)
      menuItems.push(<MenuDivider />)
      menuItems.push(
        <MenuItem onClick={labelNegToHere} text="Mark Selected Positive (rest to here Negative)" />,
      )
      menuItems.push(
        <MenuItem onClick={labelPosToHere} text="Mark Selected Negative (rest to here Positive)" />,
      )
    }
    menuItems.push(<MenuDivider />)
    menuItems.push(<MenuItem disabled={true} text={`ImageId: ${imageId}`} />)
    menuItems.push(<MenuItem disabled={true} text={`Probability: ${prob}`} />)
    return <Menu> {menuItems} </Menu>
  }
}

const mapStateToProps = (state, ownProps) => ({
  isPos: getPosLabelSet(state).contains(ownProps.imageId),
  isNeg: getNegLabelSet(state).contains(ownProps.imageId),
  isUnk: getUnkLabelSet(state).contains(ownProps.imageId),
  prob: getImageProbGetter(state)(ownProps.imageId),
  isSelected: getSelectedImageSet(state).contains(ownProps.imageId),
  someSelected: getSelectedImageSet(state).size > 0,
})

const mapDispatchToProps = (dispatch, ownProps) => {
  const imageSetToHere = OrderedSet(ownProps.imageIds.slice(0, ownProps.index + 1))
  return {
    labelPos: () => dispatch(labelImages([ownProps.imageId], [], [])),
    labelNeg: () => dispatch(labelImages([], [ownProps.imageId], [])),
    labelUnk: () => dispatch(labelImages([], [], [ownProps.imageId])),
    unlabel: () => dispatch(unlabelImages([ownProps.imageId])),
    toggleSelected: () => dispatch(toggleSelected([ownProps.imageId])),
    shiftToggleSelected: () => dispatch(toggleSelected(imageSetToHere)),
    labelSelectedPos: () => dispatch(labelSelectedPos()),
    labelSelectedNeg: () => dispatch(labelSelectedNeg()),
    labelSelectedUnk: () => dispatch(labelSelectedUnk()),
    unlabelSelected: () => dispatch(unlabelSelected()),
    labelPosToHere: () => dispatch(labelPosFlipSelected(imageSetToHere)),
    labelNegToHere: () => dispatch(labelNegFlipSelected(imageSetToHere)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenuTarget(ImageComponent))
