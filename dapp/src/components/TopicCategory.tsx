import type React from "react";

type Props = {
    value: number | string;
    onChange: Function;
    disabled?: boolean
};

function TopicCategory(props: Props) {

    function onCategoryChange(evt: React.ChangeEvent<HTMLSelectElement>) {
        if(!evt.target.value) 
            return;

        props.onChange({ target: { id: "category", value: evt.target.value }});
    }    

    return (
        <select id="category" className="form-select px-3" value={props.value} onChange={onCategoryChange} disabled={props.disabled}>
            <option>Selecione...</option>
            <option value="0">Decisão</option>
            <option value="1">Despesa</option>
            <option value="2">Alteração de Cota</option>
            <option value="3">Eleição de Síndico</option>     
        </select>
    );
}

export default TopicCategory;