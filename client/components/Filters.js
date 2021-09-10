import { useState } from "react"
import CheckBox from "./CheckBox"
import EnumInfo from './EnumInfo.json'
import { useRouter } from "next/router"

const Filters =()=>{
    const router = useRouter()
    const [rate, setRate] = useState('')

    const onApply =()=>{
        if(router.asPath.includes('rated')){
            let n = router.asPath.split('page=1')[0]
            router.push(`${n}page=1&rated=${rate}`)
        }else{
            router.push(`${router.asPath}&rated=${rate}`)
        }    
    }

    const onClear =()=>{
        let n = router.asPath.split('page=1')[0]
        router.push(`${n}page=1`)
    }
    return(
        <div>
            <h3>Rates</h3>
            {EnumInfo.rated.map((rate, i)=>{
                let n = rate.name.toUpperCase()
                return <CheckBox setfFilter={setRate} key={i} type='rated' name={n}/>})}
            <h3></h3>
            <button className='btn btn-dark btn-lg' onClick={onApply}> Apply</button>
            <button className='btn btn-dark btn-lg' style={{margin:'4%'}} onClick={onClear}> Clear</button>
        </div>
    )
}

export default Filters