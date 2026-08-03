def calculate_quality_score(cvrt_score):

    quality_score = max(0, 100 - cvrt_score)

    return round(quality_score, 2)
