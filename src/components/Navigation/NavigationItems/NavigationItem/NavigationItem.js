import React from 'react';
import classes from './NavigationItem.module.css';

const navigationItem = (props) => (
    <li className={classes.NavigationItem}>
        <a href="/">A link</a>
    </li>
);
export default navigationItem;