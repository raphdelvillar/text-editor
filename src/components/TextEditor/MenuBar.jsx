import { Menu } from "antd";

function MenuBar({mode, items}) {
    return (
        <Menu mode={mode} items={items} />
    )
}

export default MenuBar;
