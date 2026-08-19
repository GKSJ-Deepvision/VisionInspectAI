def generate_recommendation(risk_level):

    recommendations = {
        "Low": "Product is safe. Continue production.",
        "Moderate": "Perform manual inspection before approval.",
        "High": "Rework the product and inspect the production line.",
        "Critical": "Reject the product immediately and investigate the manufacturing process."
    }

    return recommendations.get(risk_level, "No recommendation available.")