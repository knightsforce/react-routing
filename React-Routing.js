import React, { Component, Children, cloneElement } from 'react';
import PropTypes from "prop-types";

let event = document.createEvent('Event');

event.initEvent('changeURL', true, true);

event.listeners = {};
event.handlers = {};

let callHandlers = (storeHandlers)=>{
 for(let key in storeHandlers) {
  setTimeout(()=>{
    storeHandlers[key]();
  }, 0);
 }
}
//Сделать снятие обработчиков и убрать пути при перезагрузке
class RouterPaths extends Component {
  constructor(props) {
    super(props);
    this.props=props;
    
    this.popstateListener = this.popstateListener.bind(this);
    
    this.renderChildren=this.renderChildren.bind(this);
    this.attached = false;
    this.state = {
      url: props.initPath || "/",
    };
    event.url = this.state.url;
    history.pushState(null, null, event.url);
  }

  componentDidMount() {

    if(!this.attached) {
      this.attached = true;
      window.addEventListener('popstate', this.popstateListener);
      document.addEventListener('changeURL', ()=>{
        this.setState({url: location.pathname});
        callHandlers(event.handlers);
      }, false);
    }

  }

  componentWillUnmount() {
    
  }

  componentWillReceiveProps(newProps) {

  }

  popstateListener() {
    this.setState({url: location.pathname});
    callHandlers(event.handlers);
  }

  renderChildren(props) {
    let child = Children.only(props.children);//column 
    
    let newProps = {
      //className: `${componentProps.className} ${child.props.className}`
    };

    return cloneElement(child, Object.assign({}, child.props, newProps));
  }

  render() {
    return (
      this.renderChildren(this.props)
    );
  }
}


class RoutePath extends Component {
  constructor(props) {
    super(props);
    this.props=props;
    this.renderComponent=this.renderComponent.bind(this);
    this.attached = false;
    this.path = props.path;
    this._id=Math.random()+"";
    this.state = {
      visible: null,
    }

  }

  componentDidMount() {
    this.setState({visible: (this.path==location.pathname)});

    if(!this.attached) {
      this.attached = true;
      
      event.handlers[this._id]=()=>{
        this.setState({visible: (this.path==location.pathname)});
      }
    }

  }

  componentWillReceiveProps(newProps) {
    if(newProps.path) {
      this.path=newProps.path;
    }
  }

  renderComponent(props) {
    
    let componentProps = props.componentProps || {};
    let Elem = props.component;
   
    let newProps = {

    };

    return <Elem {...componentProps} {...newProps}/>

  }

  render() {
    let Elem = (this.state.visible) ? this.renderComponent(this.props) : null;
    return Elem;
  }
}


class LinkPath extends Component {
  constructor(props) {
    super(props);
    this.props=props;
    this.renderChildren=this.renderChildren.bind(this);
    this.handlerClick=this.handlerClick.bind(this);
    this.url = props.url;
  }

  componentDidMount() {
    
  }

  componentWillReceiveProps(newProps) {
    if(newProps.url) {
      this.url=newProps.url;
    }
  }

  handlerClick(childHandler) {
    return (e) => {
      event.url = this.url;
      history.pushState(null, null, event.url);
      document.dispatchEvent(event);
      (childHandler) && childHandler(e);
    }
  }

  renderChildren(props) {
    
    let child = Children.only(props.children);

    let newProps = {
      onClick: this.handlerClick(child.props.onClick)
    };

    return cloneElement(child, Object.assign({}, child.props, newProps));
  }

  render() {
    return (
      this.renderChildren(this.props)
    );
  }
}

function getPathName() {
  return location.pathname;
}

export {RouterPaths, RoutePath, LinkPath, getPathName};