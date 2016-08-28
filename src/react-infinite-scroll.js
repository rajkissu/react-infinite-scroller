import React from 'react';
import ReactDOM from 'react-dom';

function topPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetTop + topPosition(domElt.offsetParent);
}

function leftPosition(domElt) {
  if (!domElt) {
    return 0;
  }
  return domElt.offsetLeft + leftPosition(domElt.offsetParent);
}

export default class InfiniteScroll extends React.Component {
  constructor(props) {
    super(props);
    
    this.scrollListener = this.scrollListener.bind(this);
  }
  componentDidMount() {
    this.pageLoaded = this.props.pageStart;
    this.attachScrollListener();
  }
  componentDidUpdate() {
    this.attachScrollListener();
  }
  render() {
    var props = this.props;
    var style = props.style;
    return React.DOM.div({ style }, props.children, props.hasMore && (props.loader || this._defaultLoader));
  }
  scrollListener() {
    var el = ReactDOM.findDOMNode(this);
    var scrollEl = window;

    var offset;
    var axis = this.props.axis;

    if (!(axis === 'x' || axis === 'y')) {
      return
    }

    if (axis === 'y') {
      if(this.props.useWindow === true) {
        var scrollTop = (scrollEl.pageYOffset !== undefined) ? scrollEl.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        offset = topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight;
      } else {
        offset = el.offsetHeight - el.parentNode.scrollTop - el.parentNode.clientHeight;
      }
    } else {
      if(this.props.useWindow === true) {
        var scrollLeft = (scrollEl.pageXOffset !== undefined) ? scrollEl.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        offset = leftPosition(el) + el.offsetWidth - scrollLeft - window.innerWidth;
      } else {
        offset = el.offsetWidth - el.parentNode.scrollLeft - el.parentNode.clientWidth;
      }
    }

    if (offset < Number(this.props.threshold)) {
      this.detachScrollListener();
      // call loadMore after detachScrollListener to allow
      // for non-async loadMore functions
      this.props.loadMore(this.pageLoaded += 1);
    }
  }
  attachScrollListener() {
    if (!this.props.hasMore) {
      return;
    }

    var scrollEl = window;
    if(this.props.useWindow == false) {
      scrollEl = ReactDOM.findDOMNode(this).parentNode;
    }

    scrollEl.addEventListener('scroll', this.scrollListener);
    scrollEl.addEventListener('resize', this.scrollListener);
    this.scrollListener();
  }
  detachScrollListener() {
    var scrollEl = window;
    if(this.props.useWindow == false) {
      scrollEl = ReactDOM.findDOMNode(this).parentNode;
    }

    scrollEl.removeEventListener('scroll', this.scrollListener);
    scrollEl.removeEventListener('resize', this.scrollListener);
  }
  componentWillUnmount() {
    this.detachScrollListener();
  }
  setDefaultLoader(loader) {
    this._defaultLoader = loader;
  }
}
InfiniteScroll.PropTypes = {
  axis: React.PropTypes.string,
  pageStart: React.PropTypes.number,
  hasMore: React.PropTypes.bool,
  loadMore: React.PropTypes.func.isRequired,
  threshold: React.PropTypes.number,
  useWindow: React.PropTypes.bool
}
InfiniteScroll.defaultProps = {
  axis: 'y',
  pageStart: 0,
  hasMore: false,
  loadMore: function () {},
  threshold: 250,
  useWindow: true
};
