def camel_case_split(identifier):
    matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', identifier)
    return [m.group(0) for m in matches]

def format_class_name(name):
    components = camel_case_split(name)
    return ''.join(x.capitalize() for x in components)

def format_file_name(name):
    class_name = format_class_name(name)
    return f"{class_name}.js"

def generate_js_model(table_name):
    template = f"""const Base = require('./Base');

class {format_class_name(table_name)} extends Base {{
  constructor() {{
    super();
  }}

  insertOne(toInsert) {{
    return new Promise((resolve, reject) => {{
      this.bdd.query(
        'INSERT INTO {table_name} SET ?', toInsert,
        (error, results, fields) => {{
          if (error) reject(error);
          resolve(results);
        }}
      );
    }});
  }}

  find(params) {{
    return new Promise((resolve, reject) => {{
      this.bdd.query(
        'SELECT * FROM {table_name} WHERE ?', params,
        (error, results, fields) => {{
          if (error) reject(error);
          resolve(results);
        }}
      );
    }});
  }}

  updateOne(toSet, params) {{
    return new Promise((resolve, reject) => {{
      this.bdd.query(
        "UPDATE {table_name} SET ? WHERE ?", [toSet, params],
        (error, results, fields) => {{
          if (error) reject(error);
          resolve(results);
        }}
      );
    }});
  }}

  deleteOne(params) {{
    return new Promise((resolve, reject) => {{
      this.bdd.query(
        "DELETE FROM {table_name} WHERE ?", params,
        (error, results, fields) => {{
          if (error) reject(error);
          resolve(results);
        }}
      );
    }});
  }}

  customQuery(query, params) {{
    return new Promise((resolve, reject) => {{
      this.bdd.query(
        query, params,
        (error, results, fields) => {{
          if (error) reject(error);
          resolve(results);
        }}
      );
    }});
  }}
}}

module.exports = new {format_class_name(table_name)}();"""

    return template

import re

table_name = input("Entrez le nom de la table: ")
output_file = f"{format_file_name(table_name)}"

with open(output_file, 'w') as f:
  f.write(generate_js_model(table_name))

print(f"Modèle généré avec succès: {output_file}")
