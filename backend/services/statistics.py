inspection_data = {
    "total_images": 0,
    "good_products": 0,
    "defective_products": 0
}


def update_statistics(status):

    inspection_data["total_images"] += 1

    if status == "Good":
        inspection_data["good_products"] += 1
    else:
        inspection_data["defective_products"] += 1


def generate_statistics():

    total = inspection_data["total_images"]

    if total == 0:
        pass_rate = 0
        failure_rate = 0
    else:
        pass_rate = round(
            (inspection_data["good_products"] / total) * 100,
            2
        )

        failure_rate = round(
            (inspection_data["defective_products"] / total) * 100,
            2
        )

    return {
        "total_images_inspected": total,
        "good_products": inspection_data["good_products"],
        "defective_products": inspection_data["defective_products"],
        "pass_rate": f"{pass_rate}%",
        "failure_rate": f"{failure_rate}%"
    }