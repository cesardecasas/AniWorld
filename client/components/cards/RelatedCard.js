import Link from "next/link"

const RelatedCard =({card})=>{

    return(
        <Link href={`/${card.type}/${card.mal_id}`}>
            <section style={{backgroundColor:'white',   boxShadow:'12px 12px 2px 1px rgba(0, 0, 255, .2)'}} className='refCard'>
                <p style={{textAlign:'center'}}>{card.name}</p>
            </section>
        </Link>
    )
}

export default RelatedCard