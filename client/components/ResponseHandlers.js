export const ErrorCard =(props)=>{

    return(<div className="alert alert-danger" role="alert">No {props.msg} Found</div>)
}

export const Loader = ()=>{
    return(
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )
}
 