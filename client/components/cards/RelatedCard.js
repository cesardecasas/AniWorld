import Link from "next/link"

const RelatedCard =({card, type})=>{

    return(
        <Link href={`/${card.type}/${card.mal_id}`}>
            <section className='refCard'>
                <p style={{textAlign:'center'}}>{card.name}</p>
            </section>
        </Link>
    )
}

export default RelatedCard