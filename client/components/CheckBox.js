

const CheckBox =({name, setfFilter})=>{

    const handleChange =()=>{
        setfFilter(name.toLowerCase())
    }

    return(
        <div className="form-check">
        <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" onChange={()=>handleChange()}/>
        <label className="form-check-label" htmlFor="flexRadioDefault1">
           {name}
        </label>
        </div>
    )
}

export default CheckBox