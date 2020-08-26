import React, { Component } from 'react';
import Aux from '../../hoc/Auxillary/Auxillary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'
const INGREDIENT_PRICES = {
    salad: 0.5,
    cheese: 0.4,
    meat: 1.3,
    bacon: 0.7
}

class BurgerBuilder extends Component {
    // constructor(props){
    //     super(props);
    //     this.state={...}
    // }
    state = {
        ingredients: null,
        totalPrice: 4,
        purchaseable: false,
        purchasing: false,
        loading: false,
        error:false
    }


    componentDidMount() {
        axios.get('https://react-my-burger-9e14e.firebaseio.com/ingredients.json')
            .then(response => {
                this.setState({
                    ingredients: response.data
                });
            }).catch(error=>{
                this.setState({
                    error:true
                });
            });
    }
    updatePurchaseState(ingredients) {
        const sum = Object.keys(ingredients)
            .map(igkey => {
                return ingredients[igkey]
            }).reduce((sum, el) => {
                return sum + el;
            }, 0);
        this.setState({ purchaseable: sum > 0 });
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCounted = oldCount + 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCounted;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.updatePurchaseState(updatedIngredients);
        this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });
    }

    purchaseHandler = () => {
        this.setState({
            purchasing: true
        });
    }



    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if (oldCount <= 0) {
            return;
        }
        const updatedCounted = oldCount - 1;
        const updatedIngredients = {
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCounted;
        const priceAddition = INGREDIENT_PRICES[type]
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceAddition;
        this.updatePurchaseState(updatedIngredients);
        this.setState({ totalPrice: newPrice, ingredients: updatedIngredients });

    }

    purchaseCancelHandler = () => {
        this.setState({ purchasing: false });
    };

    purchaseContinueHandler = () => {
        // alert('You Continue');
        this.setState({ loading: true });
        const order = {
            ingredients: this.state.ingredients,
            price: this.state.totalPrice,
            customer: {
                name: 'Robin',
                address: {
                    street: 'Vennikulam',
                    zipCode: '682305',
                    country: 'India'
                },
                email: 'robinv312@gmail.com'
            },
            deliveryMethod: 'fastest'
        }
        axios.post('/orders.json', order).then(response => {


            this.setState({ loading: false, purchasing: false });
        })
            .catch(error => {
                this.setState({
                    loading: false, purchasing: false
                });
            });
    }

    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0

        }
        let orderSummary = null;

        let burger = this.state.error?<p>Ingredients can't be loaded!</p>:<Spinner/>;
        if (this.state.ingredients) {
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls
                        ingredientAdded={this.addIngredientHandler}
                        ingredientRemoved={this.removeIngredientHandler}
                        disabled={disabledInfo}
                        purchaseable={this.state.purchaseable}
                        price={this.state.totalPrice}
                        ordered={this.purchaseHandler} />
                </Aux>);
            orderSummary = <OrderSummary
                price={this.state.totalPrice.toFixed(2)}
                ingredients={this.state.ingredients}
                purchaseCancelled={this.purchaseCancelHandler}
                purchaseContinued={this.purchaseContinueHandler} />;

        }
        
        if (this.state.loading) {
            orderSummary = <Spinner />;
        }


        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}

            </Aux>
        );
    }
}
export default withErrorHandler(BurgerBuilder, axios);