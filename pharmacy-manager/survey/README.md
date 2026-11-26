# Survey: how do pharmacies in Sanirakhra, Dhaka manage stock and sales?

This folder holds the material behind the project: the questionnaire, a CSV template for the answers, and a script that turns the answers into tables and charts.

## Question and finding

**Question:** do pharmacies use a pharmacy management app, or do they work manually?

**Finding:** most pharmacies worked offline and manually. The reasons given were mainly lack of knowledge about such software and lack of staff to operate it, among others. The exact counts are produced by `analyze_survey.py` (see below) and saved in `results/results.md`.

## Files

| File | What it is |
|---|---|
| `questionnaire.md` | The questions and what each CSV column means |
| `responses_template.csv` | Empty file with the column headers: copy it to `responses.csv` |
| `responses_example.csv` | **Fake** rows, only to try the script |
| `analyze_survey.py` | Reads the CSV, writes `results/results.md` and charts |
| `results/` | Generated tables and charts (safe to publish) |

## Run the analysis

```bash
pip install -r requirements.txt        # only needed for charts
python analyze_survey.py responses_example.csv   # try it with the fake data
python analyze_survey.py responses.csv           # your real answers
```

The script writes `results/results.md` and `results/charts/*.png`.

## Privacy

- Use codes (`P01`, `P02`...) instead of shop names in `pharmacy_id`.
- `responses.csv` is listed in `.gitignore`, so the raw answers stay on your computer. Publish only the aggregated `results/` folder.
- Do not publish names, phone numbers or exact addresses of shops or owners without their permission.
- If you use a screenshot from an online map, check the map provider's terms and keep the attribution visible.
